import { deleteField, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { STAMP_REWARDS, STAMP_SPOTS } from '../data';
import { db } from '../lib/firebase';
import type { StampRecord, StampSpot } from '../types';
import { useLatest } from './useLatest';

export interface AwardResult {
  spot: StampSpot;
  unlockedRewardIds: string[];
}

/** stamps/{uid} 문서 하나에 스탬프 지점별 획득 시각을 map으로 저장한다 */
export function useStamps(uid: string | null) {
  const [stamps, setStamps] = useState<StampRecord[]>([]);
  const [freshStampId, setFreshStampId] = useState<string | null>(null);
  const stampsRef = useLatest(stamps);

  useEffect(() => {
    if (!uid || !db) {
      setStamps([]);
      return undefined;
    }
    const ref = doc(db, 'stamps', uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      const records = (snap.data()?.records ?? {}) as Record<string, string>;
      setStamps(Object.entries(records).map(([spotId, earnedAt]) => ({ spotId, earnedAt })));
    });
    return unsubscribe;
  }, [uid]);

  /** 선호 스탬프가 이미 있으면 아직 안 찍은 첫 스탬프로 대체한다. 모두 찍었다면 null */
  const awardStamp = useCallback(
    async (preferredId?: string): Promise<AwardResult | null> => {
      if (!uid || !db) return null;
      const owned = new Set(stampsRef.current.map((stamp) => stamp.spotId));
      const preferred = STAMP_SPOTS.find((spot) => spot.id === preferredId && !owned.has(spot.id));
      const target = preferred ?? STAMP_SPOTS.find((spot) => !owned.has(spot.id));
      if (!target) return null;

      const before = stampsRef.current.length;
      const after = before + 1;
      await setDoc(doc(db, 'stamps', uid), { records: { [target.id]: new Date().toISOString() } }, { merge: true });
      setFreshStampId(target.id);

      const unlockedRewardIds = STAMP_REWARDS.filter(
        (reward) => reward.threshold > before && reward.threshold <= after,
      ).map((reward) => reward.id);
      return { spot: target, unlockedRewardIds };
    },
    [stampsRef, uid],
  );

  const toggleStamp = useCallback(
    async (spotId: string) => {
      if (!uid || !db) return;
      const owned = stampsRef.current.some((stamp) => stamp.spotId === spotId);
      if (owned) {
        try {
          await setDoc(doc(db, 'stamps', uid), { records: { [spotId]: deleteField() } }, { merge: true });
        } catch {
          // 문서가 아직 없으면 지울 것도 없다
        }
      } else {
        await awardStamp(spotId);
      }
    },
    [awardStamp, stampsRef, uid],
  );

  const clearStamps = useCallback(async () => {
    if (!uid || !db) return;
    await setDoc(doc(db, 'stamps', uid), { records: {} });
  }, [uid]);

  const clearFreshStamp = useCallback(() => setFreshStampId(null), []);

  return { stamps, freshStampId, awardStamp, toggleStamp, clearStamps, clearFreshStamp };
}
