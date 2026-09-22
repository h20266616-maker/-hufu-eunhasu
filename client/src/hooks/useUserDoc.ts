import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_NOTIFICATION_PREFS, DEFAULT_PROFILE, GUEST_PROFILE } from '../data';
import { db } from '../lib/firebase';
import type { NotificationKey, Profile } from '../types';

export interface UserDoc extends Profile {
  cash: number;
  cumulativeCashback: number;
  claimedRewards: string[];
  notificationPrefs: Record<NotificationKey, boolean>;
}

const DEFAULT_USER_DOC: UserDoc = {
  ...DEFAULT_PROFILE,
  cash: 0,
  cumulativeCashback: 0,
  claimedRewards: [],
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};

const GUEST_USER_DOC: UserDoc = {
  ...GUEST_PROFILE,
  cash: 0,
  cumulativeCashback: 0,
  claimedRewards: [],
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};

/** users/{uid} 문서 전체(개인정보·캐시·스탬프 보상·알림 설정)를 구독한다 */
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
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData({ ...DEFAULT_USER_DOC, ...(snap.data() as Partial<UserDoc>) });
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
    });
    return unsubscribe;
    // fallback은 로그인 순간의 auth 정보라 uid가 바뀔 때만 다시 평가하면 된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const update = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!uid || !db) return;
      await setDoc(doc(db, 'users', uid), patch, { merge: true });
    },
    [uid],
  );

  return { data, loaded, update };
}
