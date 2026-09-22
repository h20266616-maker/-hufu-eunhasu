import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, firebaseReady } from '../lib/firebase';

export type AuthResult = { ok: true } | { ok: false; message: string };

interface AuthContextValue {
  user: User | null;
  /** 최초 로그인 상태 확인이 끝났는지 (깜빡임 방지용) */
  authLoading: boolean;
  firebaseReady: boolean;
  signInGoogle: () => Promise<AuthResult>;
  signInEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpEmail: (email: string, password: string) => Promise<AuthResult>;
  signOutUser: () => Promise<void>;
  /** 실서비스는 재인증과 서버 측 데이터 삭제가 필요하다. 여기서는 로그아웃으로 대체하는 mock */
  deleteAccountMock: () => Promise<void>;
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
      return '이미 가입된 이메일이에요. 로그인해 주세요.';
    case 'auth/weak-password':
      return '비밀번호는 6자 이상으로 만들어 주세요.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '로그인 창이 닫혔어요. 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.';
    default:
      return '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthLoading(false);
    });
    return unsubscribe;
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

  const signUpEmail: AuthContextValue['signUpEmail'] = async (email, password) => {
    if (!auth) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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
      value={{ user, authLoading, firebaseReady, signInGoogle, signInEmail, signUpEmail, signOutUser, deleteAccountMock }}
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
