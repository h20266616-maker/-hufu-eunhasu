import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db, firebaseReady } from '../lib/firebase';

export type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthContextValue {
  user: User | null;
  /** 익명(체험) 계정인지. 화면 표시 용도로만 쓴다 — 기능 제한에는 절대 쓰지 않는다 */
  isGuest: boolean;
  /** 최초 로그인 상태 확인이 끝났는지 (깜빡임 방지용) */
  authLoading: boolean;
  firebaseReady: boolean;
  signInGoogle: () => Promise<AuthResult>;
  signInEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpEmail: (email: string, password: string, name: string, phone: string) => Promise<AuthResult>;
  signOutUser: () => Promise<void>;
  /** 실서비스는 재인증과 서버 측 데이터 삭제가 필요하다. 여기서는 로그아웃으로 대체하는 mock */
  deleteAccountMock: () => Promise<void>;
  /** Firebase 익명 로그인으로 체험 계정을 시작한다. 새로고침해도 같은 세션이 유지된다 */
  enterGuestMode: () => Promise<AuthResult>;
  /** 체험(익명) 계정을 이메일 계정으로 전환한다. uid가 그대로 이어져서 데이터가 유지된다 */
  upgradeWithEmail: (email: string, password: string, name: string, phone: string) => Promise<AuthResult>;
  /** 체험(익명) 계정을 Google 계정으로 전환한다 */
  upgradeWithGoogle: () => Promise<AuthResult>;
}

const NOT_CONFIGURED_MESSAGE = 'Firebase 설정이 아직 없어요. .env.local에 값을 넣어주세요.';

function describeAuthError(error: unknown): string {
  const code = error instanceof Error && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-email':
      return '이메일 형식을 확인해 주세요.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 올바르지 않아요.';
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return '이미 가입된 이메일이에요. 로그인해 주세요.';
    case 'auth/weak-password':
      return '비밀번호는 6자 이상으로 만들어 주세요.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '로그인 창이 닫혔어요. 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.';
    case 'auth/admin-restricted-operation':
      return 'Firebase 콘솔에서 익명 로그인을 켜야 체험 계정을 쓸 수 있어요.';
    default:
      return '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(firebaseReady);
  const isGuest = user?.isAnonymous ?? false;

  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const enterGuestMode = useCallback(async (): Promise<AuthResult> => {
    if (!auth) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    try {
      // 이미 체험 세션이 있으면 Firebase가 같은 익명 사용자를 그대로 돌려준다 (새로 안 만든다)
      await signInAnonymously(auth);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  }, []);

  const signInGoogle: AuthContextValue['signInGoogle'] = async () => {
    if (!auth) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  };

  const signInEmail: AuthContextValue['signInEmail'] = async (email, password) => {
    if (!auth) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  };

  const signUpEmail: AuthContextValue['signUpEmail'] = async (email, password, name, phone) => {
    if (!auth || !db) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // 이름·전화번호는 Firestore에만 저장한다 (콘솔·코드에는 남기지 않는다)
      await setDoc(doc(db, 'users', credential.user.uid), { name, phone }, { merge: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  };

  // 체험(익명) 계정 → 정식 계정 전환. linkWithCredential로 같은 uid를 그대로 이어받는다
  const upgradeWithEmail: AuthContextValue['upgradeWithEmail'] = async (email, password, name, phone) => {
    if (!auth || !db) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    if (!auth.currentUser) return { ok: false, message: '체험 계정 상태를 확인할 수 없어요. 다시 시도해 주세요.' };
    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(auth.currentUser, credential);
      await setDoc(doc(db, 'users', result.user.uid), { name, phone, isGuest: false }, { merge: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  };

  const upgradeWithGoogle: AuthContextValue['upgradeWithGoogle'] = async () => {
    if (!auth || !db) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    if (!auth.currentUser) return { ok: false, message: '체험 계정 상태를 확인할 수 없어요. 다시 시도해 주세요.' };
    try {
      const result = await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
      await setDoc(doc(db, 'users', result.user.uid), { isGuest: false }, { merge: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const deleteAccountMock = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        authLoading,
        firebaseReady,
        signInGoogle,
        signInEmail,
        signUpEmail,
        signOutUser,
        deleteAccountMock,
        enterGuestMode,
        upgradeWithEmail,
        upgradeWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있어요');
  return value;
}
