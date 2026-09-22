import { arrayUnion, increment } from 'firebase/firestore';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { MOCK_RECEIPTS, STAMP_REWARDS, VERIFY_LATENCY_MS } from '../data';
import { useAuth } from './AuthContext';
import { useCommunity } from '../hooks/useCommunity';
import { useLatest } from '../hooks/useLatest';
import { useReceipts } from '../hooks/useReceipts';
import { useRide } from '../hooks/useRide';
import { useStamps } from '../hooks/useStamps';
import { useUserDoc } from '../hooks/useUserDoc';
import type { NotificationKey, Profile, ReceiptCategory, ReceiptRecord, StampSpot } from '../types';
import { getEffectiveRate, getNextTier, getTier } from '../utils/cashback';
import { randomBetween, wait } from '../utils/format';

export type VerifyInput =
  | { source: 'photo' }
  | { source: 'cash'; shop: string; amount: number; category: ReceiptCategory; stampId: string };

export type VerifyOutcome =
  | { ok: true; receipt: ReceiptRecord; stamp: StampSpot | null; unlockedRewardIds: string[] }
  | { ok: false; message: string };

const VERIFY_FAILURE_MESSAGE = '영수증을 읽지 못했어요. 밝은 곳에서 평평하게 펴서 다시 촬영해 주세요.';
const LOGIN_REQUIRED_MESSAGE = '로그인하고 인증해 주세요.';

function useAppState() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const { data: userDoc, update: updateUserDoc } = useUserDoc(uid, {
    nickname: user?.displayName ?? undefined,
    email: user?.email ?? undefined,
  });
  const { receipts, commitReceipt } = useReceipts(uid);
  const stampsState = useStamps(uid);
  const community = useCommunity(uid);
  const rideState = useRide();
  const mockCursor = useRef(0);

  const [failNextVerify, setFailNextVerify] = useState(false);
  const failNextRef = useLatest(failNextVerify);
  const claimedRef = useLatest(userDoc.claimedRewards);
  const stampCountRef = useLatest(stampsState.stamps.length);
  const { awardStamp } = stampsState;

  const verify = useCallback(
    async (input: VerifyInput): Promise<VerifyOutcome> => {
      if (!uid) return { ok: false, message: LOGIN_REQUIRED_MESSAGE };
      await wait(randomBetween(VERIFY_LATENCY_MS.min, VERIFY_LATENCY_MS.max));

      if (failNextRef.current) {
        setFailNextVerify(false);
        return { ok: false, message: VERIFY_FAILURE_MESSAGE };
      }

      const index = mockCursor.current % MOCK_RECEIPTS.length;
      mockCursor.current += 1;
      const mock = MOCK_RECEIPTS[index];
      const resolved = input.source === 'cash' ? input : mock ?? null;
      if (!resolved) return { ok: false, message: VERIFY_FAILURE_MESSAGE };

      try {
        const receipt = await commitReceipt(
          { shop: resolved.shop, amount: resolved.amount, category: resolved.category, source: input.source },
          userDoc.soldierVerified,
        );
        const awarded = await awardStamp(resolved.stampId);
        return {
          ok: true,
          receipt,
          stamp: awarded?.spot ?? null,
          unlockedRewardIds: awarded?.unlockedRewardIds ?? [],
        };
      } catch {
        return { ok: false, message: '인증 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' };
      }
    },
    [awardStamp, commitReceipt, failNextRef, uid, userDoc.soldierVerified],
  );

  const claimReward = useCallback(
    async (rewardId: string): Promise<boolean> => {
      const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
      if (!reward || !uid) return false;
      if (reward.soldierOnly && !userDoc.soldierVerified) return false;
      if (claimedRef.current.includes(rewardId)) return false;
      if (stampCountRef.current < reward.threshold) return false;
      await updateUserDoc({
        claimedRewards: arrayUnion(rewardId),
        ...(reward.cash > 0 ? { cash: increment(reward.cash) } : {}),
      });
      return true;
    },
    [claimedRef, stampCountRef, uid, updateUserDoc, userDoc.soldierVerified],
  );

  const updateProfile = useCallback((patch: Partial<Profile>) => updateUserDoc(patch), [updateUserDoc]);

  const setNotificationPref = useCallback(
    (key: NotificationKey, value: boolean) => updateUserDoc({ notificationPrefs: { [key]: value } }),
    [updateUserDoc],
  );

  const verifySoldier = useCallback(
    (unit: string, dischargeDate: string) =>
      updateUserDoc({ soldierVerified: true, soldierUnit: unit, soldierDischargeDate: dischargeDate }),
    [updateUserDoc],
  );

  const addCashDemo = useCallback((amount: number) => updateUserDoc({ cash: increment(amount) }), [updateUserDoc]);

  const spendCash = useCallback(
    async (price: number): Promise<boolean> => {
      if (!uid || userDoc.cash < price) return false;
      await updateUserDoc({ cash: increment(-price) });
      return true;
    },
    [uid, updateUserDoc, userDoc.cash],
  );

  const derived = {
    cumulativeCashback: userDoc.cumulativeCashback,
    currentTier: getTier(receipts.length),
    nextTier: getNextTier(receipts.length),
    effectiveRate: getEffectiveRate(getTier(receipts.length).rate, userDoc.soldierVerified),
  };

  return {
    uid,
    profile: userDoc,
    cash: userDoc.cash,
    receipts,
    ...derived,
    ...stampsState,
    ...community,
    ...rideState,
    updateProfile,
    verifySoldier,
    claimedRewards: userDoc.claimedRewards,
    claimReward,
    notificationPrefs: userDoc.notificationPrefs,
    setNotificationPref,
    verify,
    failNextVerify,
    setFailNextVerify,
    addCashDemo,
    spendCash,
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
