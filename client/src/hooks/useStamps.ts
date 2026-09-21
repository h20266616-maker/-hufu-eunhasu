import { useCallback, useState } from 'react';
import { STAMP_REWARDS, STAMP_SPOTS } from '../data';
import type { StampRecord, StampSpot } from '../types';
import { useLatest } from './useLatest';
import { usePersistentState } from './usePersistentState';

export interface AwardResult {
  spot: StampSpot;
  unlockedRewardIds: string[];
}

export function useStamps() {
  const [stamps, setStamps] = usePersistentState<StampRecord[]>('stamps', () => []);
  const [freshStampId, setFreshStampId] = useState<string | null>(null);
  const stampsRef = useLatest(stamps);

  /** 선호 스탬프가 이미 있으면 아직 안 찍은 첫 스탬프로 대체한다. 모두 찍었다면 null */
  const awardStamp = useCallback(
    (preferredId?: string): AwardResult | null => {
      const owned = new Set(stampsRef.current.map((stamp) => stamp.spotId));
      const preferred = STAMP_SPOTS.find((spot) => spot.id === preferredId && !owned.has(spot.id));
      const target = preferred ?? STAMP_SPOTS.find((spot) => !owned.has(spot.id));
      if (!target) return null;

      const before = stampsRef.current.length;
      const after = before + 1;
      setStamps((prev) => [...prev, { spotId: target.id, earnedAt: new Date().toISOString() }]);
      setFreshStampId(target.id);

      const unlockedRewardIds = STAMP_REWARDS.filter(
        (reward) => reward.threshold > before && reward.threshold <= after,
      ).map((reward) => reward.id);
      return { spot: target, unlockedRewardIds };
    },
    [setStamps, stampsRef],
  );

  const toggleStamp = useCallback(
    (spotId: string) => {
      const owned = stampsRef.current.some((stamp) => stamp.spotId === spotId);
      if (owned) {
        setStamps((prev) => prev.filter((stamp) => stamp.spotId !== spotId));
      } else {
        awardStamp(spotId);
      }
    },
    [awardStamp, setStamps, stampsRef],
  );

  const clearStamps = useCallback(() => setStamps([]), [setStamps]);
  const clearFreshStamp = useCallback(() => setFreshStampId(null), []);

  return { stamps, freshStampId, awardStamp, toggleStamp, clearStamps, clearFreshStamp };
}
