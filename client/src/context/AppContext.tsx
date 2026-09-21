import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PROFILE,
  MOCK_RECEIPTS,
  STAMP_REWARDS,
  VERIFY_LATENCY_MS,
} from '../data';
import { clearPersistedState, usePersistentState } from '../hooks/usePersistentState';
import { useCommunity } from '../hooks/useCommunity';
import { useLatest } from '../hooks/useLatest';
import { useRide } from '../hooks/useRide';
import { useStamps } from '../hooks/useStamps';
import { useWallet } from '../hooks/useWallet';
import type {
  NotificationKey,
  Profile,
  ReceiptCategory,
  ReceiptRecord,
  StampSpot,
} from '../types';
import { randomBetween, wait } from '../utils/format';

export type VerifyInput =
  | { source: 'photo' }
  | { source: 'cash'; shop: string; amount: number; category: ReceiptCategory; stampId: string };

export type VerifyOutcome =
  | { ok: true; receipt: ReceiptRecord; stamp: StampSpot | null; unlockedRewardIds: string[] }
  | { ok: false; message: string };

const VERIFY_FAILURE_MESSAGE = '영수증을 읽지 못했어요. 밝은 곳에서 평평하게 펴서 다시 촬영해 주세요.';

function useAppState() {
  const wallet = useWallet();
  const stamps = useStamps();
  const community = useCommunity();
  const rideState = useRide();
  const [profile, setProfile] = usePersistentState<Profile>('profile', () => DEFAULT_PROFILE);
  const [claimedRewards, setClaimedRewards] = usePersistentState<string[]>('claimed-rewards', () => []);
  const [notificationPrefs, setNotificationPrefs] = usePersistentState<Record<NotificationKey, boolean>>(
    'notification-prefs',
    () => DEFAULT_NOTIFICATION_PREFS,
  );
  const [failNextVerify, setFailNextVerify] = useState(false);
  const failNextRef = useLatest(failNextVerify);
  const claimedRef = useLatest(claimedRewards);
  const stampCountRef = useLatest(stamps.stamps.length);

  const { commitReceipt, getReceiptCount, addCash } = wallet;
  const { awardStamp } = stamps;

  const verify = useCallback(
    async (input: VerifyInput): Promise<VerifyOutcome> => {
      await wait(randomBetween(VERIFY_LATENCY_MS.min, VERIFY_LATENCY_MS.max));

      if (failNextRef.current) {
        setFailNextVerify(false);
        return { ok: false, message: VERIFY_FAILURE_MESSAGE };
      }

      const mock = MOCK_RECEIPTS[getReceiptCount() % MOCK_RECEIPTS.length];
      const resolved =
        input.source === 'cash'
          ? input
          : mock
            ? { shop: mock.shop, amount: mock.amount, category: mock.category, stampId: mock.stampId }
            : null;
      if (!resolved) return { ok: false, message: VERIFY_FAILURE_MESSAGE };

      const receipt = commitReceipt({
        shop: resolved.shop,
        amount: resolved.amount,
        category: resolved.category,
        source: input.source,
      });
      const awarded = awardStamp(resolved.stampId);
      return {
        ok: true,
        receipt,
        stamp: awarded?.spot ?? null,
        unlockedRewardIds: awarded?.unlockedRewardIds ?? [],
      };
    },
    [awardStamp, commitReceipt, failNextRef, getReceiptCount],
  );

  const claimReward = useCallback(
    (rewardId: string): boolean => {
      const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
      if (!reward) return false;
      if (claimedRef.current.includes(rewardId)) return false;
      if (stampCountRef.current < reward.threshold) return false;
      setClaimedRewards((prev) => [...prev, rewardId]);
      if (reward.cash > 0) addCash(reward.cash);
      return true;
    },
    [addCash, claimedRef, setClaimedRewards, stampCountRef],
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => setProfile((prev) => ({ ...prev, ...patch })),
    [setProfile],
  );

  const setNotificationPref = useCallback(
    (key: NotificationKey, value: boolean) => setNotificationPrefs((prev) => ({ ...prev, [key]: value })),
    [setNotificationPrefs],
  );

  const resetAll = useCallback(() => {
    clearPersistedState();
    window.location.reload();
  }, []);

  return {
    ...wallet,
    ...stamps,
    ...community,
    ...rideState,
    profile,
    updateProfile,
    claimedRewards,
    claimReward,
    notificationPrefs,
    setNotificationPref,
    verify,
    failNextVerify,
    setFailNextVerify,
    resetAll,
  };
}

export type AppContextValue = ReturnType<typeof useAppState>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp은 AppProvider 안에서만 사용할 수 있어요');
  return value;
}
