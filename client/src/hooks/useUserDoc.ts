import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_NOTIFICATION_PREFS, DEFAULT_PROFILE, GUEST_PROFILE } from '../data';
import { db } from '../lib/firebase';
import type { NotificationKey, Profile } from '../types';

export interface UserDoc extends Profile {
  /** 지금 쓸 수 있는 잔액. 인증으로 늘고 사용으로 준다 */
  currentCashback: number;
  /** 한 번이라도 적립된 전체 금액. 사용해도 줄지 않는다 */
  totalCashback: number;
  /** 지금까지 사용한 금액의 합. currentCashback + usedCashback = totalCashback을 유지한다 */
  usedCashback: number;
  claimedRewards: string[];
  notificationPrefs: Record<NotificationKey, boolean>;
}

const DEFAULT_USER_DOC: UserDoc = {
  ...DEFAULT_PROFILE,
  currentCashback: 0,
  totalCashback: 0,
  usedCashback: 0,
  claimedRewards: [],
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};

const GUEST_USER_DOC: UserDoc = {
  ...GUEST_PROFILE,
  currentCashback: 0,
  totalCashback: 0,
  usedCashback: 0,
  claimedRewards: [],
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};

/** 예전 필드명(cash/cumulativeCashback)으로 저장된 문서를 읽어도 값이 사라지지 않게 한다 */
interface LegacyFields {
  cash?: number;
  cumulativeCashback?: number;
}

function normalizeUserDoc(raw: Partial<UserDoc> & LegacyFields): Partial<UserDoc> {
  const { cash, cumulativeCashback, ...rest } = raw;
  return {
    ...rest,
    currentCashback: rest.currentCashback ?? cash,
    totalCashback: rest.totalCashback ?? cumulativeCashback,
  };
}

/** users/{uid} 문서 전체(개인정보·캐시백·스탬프 보상·알림 설정)를 구독한다 */
export function useUserDoc(uid: string | null, fallback: { nickname?: string; email?: string }) {
  const [data, setData] = useState<UserDoc>(GUEST_USER_DOC);
  const [loaded, setLoaded] = useState(uid === null);

  useEffect(() => {
    if (!uid || !db) {
      setData(GUEST_USER_DOC);
      setLoaded(true);
      return undefined;
    }
    setLoaded(false);
    const ref = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setData({ ...DEFAULT_USER_DOC, ...normalizeUserDoc(snap.data() as Partial<UserDoc> & LegacyFields) });
        } else {
          const initial: UserDoc = {
            ...DEFAULT_USER_DOC,
            nickname: fallback.nickname || DEFAULT_USER_DOC.nickname,
            email: fallback.email || DEFAULT_USER_DOC.email,
          };
          void setDoc(ref, initial);
          setData(initial);
        }
        setLoaded(true);
      },
      (error) => {
        console.error('[useUserDoc] 사용자 정보를 불러오지 못했어요', error);
        setLoaded(true);
      },
    );
    return unsubscribe;
    // fallback은 로그인 순간의 auth 정보라 uid가 바뀔 때만 다시 평가하면 된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const update = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!uid || !db) return;
      try {
        await setDoc(doc(db, 'users', uid), patch, { merge: true });
      } catch (error) {
        console.error('[useUserDoc] 사용자 정보 저장에 실패했어요', error);
        throw error;
      }
    },
    [uid],
  );

  return { data, loaded, update };
}
