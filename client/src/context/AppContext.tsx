import { arrayUnion, increment } from 'firebase/firestore';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_PROFILE,
  MOCK_RECEIPTS,
  STAMP_REWARDS,
  STAMP_SPOTS,
  VERIFY_LATENCY_MS,
} from '../data';
import { useAuth } from './AuthContext';
import { useCommunity } from '../hooks/useCommunity';
import { useLatest } from '../hooks/useLatest';
import { useReceipts } from '../hooks/useReceipts';
import { useRide } from '../hooks/useRide';
import { useStamps } from '../hooks/useStamps';
import { useUserDoc } from '../hooks/useUserDoc';
import type { NotificationKey, Profile, ReceiptCategory, ReceiptRecord, StampRecord, StampSpot } from '../types';
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

interface GuestState {
  profile: Profile;
  cash: number;
  receipts: ReceiptRecord[];
  stamps: StampRecord[];
  claimedRewards: string[];
  notificationPrefs: Record<NotificationKey, boolean>;
}

function createGuestState(): GuestState {
  return {
    profile: { ...DEFAULT_PROFILE, nickname: '게스트' },
    cash: 0,
    receipts: [],
    stamps: [],
    claimedRewards: [],
    notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  };
}

/** 스탬프 지점을 하나 고른다. 선호 지점이 이미 있으면 아직 안 찍은 다른 지점을 고른다 */
function pickStampSpot(owned: StampRecord[], preferredId?: string): StampSpot | null {
  const ownedIds = new Set(owned.map((stamp) => stamp.spotId));
  const preferred = STAMP_SPOTS.find((spot) => spot.id === preferredId && !ownedIds.has(spot.id));
  return preferred ?? STAMP_SPOTS.find((spot) => !ownedIds.has(spot.id)) ?? null;
}

function useAppState() {
  const { user, isGuest, guestId } = useAuth();
  const realUid = user?.uid ?? null;
  // 게스트는 Firestore를 건드리지 않는다 — Firestore 훅에는 항상 null을 넘긴다
  const firestoreUid = isGuest ? null : realUid;
  // uid는 "지금 앱을 쓸 수 있는 상태인가"를 뜻한다. 게스트도 로컬로는 인증·스탬프를 쓸 수 있어서 non-null이다
  const uid = isGuest ? guestId : realUid;

  const { data: userDoc, update: updateUserDocFirestore } = useUserDoc(firestoreUid, {
    nickname: user?.displayName ?? undefined,
    email: user?.email ?? undefined,
  });
  const { receipts: firestoreReceipts, commitReceipt: commitReceiptFirestore } = useReceipts(firestoreUid);
  const stampsState = useStamps(firestoreUid);
  const community = useCommunity(realUid);
  const rideState = useRide();
  const mockCursor = useRef(0);

  const [guestState, setGuestState] = useState<GuestState>(createGuestState);
  const guestStateRef = useLatest(guestState);

  const [failNextVerify, setFailNextVerify] = useState(false);
  const failNextRef = useLatest(failNextVerify);

  const profile = isGuest ? guestState.profile : userDoc;
  const cash = isGuest ? guestState.cash : userDoc.cash;
  const receipts = isGuest ? guestState.receipts : firestoreReceipts;
  const stamps = isGuest ? guestState.stamps : stampsState.stamps;
  const claimedRewards = isGuest ? guestState.claimedRewards : userDoc.claimedRewards;
  const notificationPrefs = isGuest ? guestState.notificationPrefs : userDoc.notificationPrefs;
  const freshStampId = isGuest ? null : stampsState.freshStampId;

  const claimedRef = useLatest(claimedRewards);
  const stampCountRef = useLatest(stamps.length);
  const { awardStamp: awardStampFirestore, setFreshStampId } = stampsState;

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

      if (isGuest) {
        const before = guestStateRef.current;
        const tier = getTier(before.receipts.length);
        const rate = getEffectiveRate(tier.rate, before.profile.soldierVerified);
        const cashback = Math.round((resolved.amount * rate) / 100);
        const record: ReceiptRecord = {
          id: `guest-receipt-${Date.now()}`,
          shop: resolved.shop,
          amount: resolved.amount,
          category: resolved.category,
          source: input.source,
          rate,
          cashback,
          createdAt: new Date().toISOString(),
        };
        const target = pickStampSpot(before.stamps, resolved.stampId);
        const nextStamps = target ? [...before.stamps, { spotId: target.id, earnedAt: new Date().toISOString() }] : before.stamps;
        const unlockedRewardIds = target
          ? STAMP_REWARDS.filter(
              (reward) => reward.threshold > before.stamps.length && reward.threshold <= nextStamps.length,
            ).map((reward) => reward.id)
          : [];
        setGuestState((prev) => ({
          ...prev,
          receipts: [record, ...prev.receipts],
          cash: prev.cash + cashback,
          stamps: nextStamps,
        }));
        return { ok: true, receipt: record, stamp: target, unlockedRewardIds };
      }

      try {
        const receipt = await commitReceiptFirestore(
          { shop: resolved.shop, amount: resolved.amount, category: resolved.category, source: input.source },
          userDoc.soldierVerified,
        );
        const awarded = await awardStampFirestore(resolved.stampId);
        return {
          ok: true,
          receipt,
          stamp: awarded?.spot ?? null,
          unlockedRewardIds: awarded?.unlockedRewardIds ?? [],
        };
      } catch (error) {
        console.error('[AppContext] 영수증 인증 처리 중 오류가 발생했어요', error);
        return { ok: false, message: '인증 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' };
      }
    },
    [awardStampFirestore, commitReceiptFirestore, failNextRef, guestStateRef, isGuest, uid, userDoc.soldierVerified],
  );

  const claimReward = useCallback(
    async (rewardId: string): Promise<boolean> => {
      const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
      if (!reward || !uid) return false;

      if (isGuest) {
        const g = guestStateRef.current;
        if (reward.soldierOnly && !g.profile.soldierVerified) return false;
        if (g.claimedRewards.includes(rewardId)) return false;
        if (g.stamps.length < reward.threshold) return false;
        setGuestState((prev) => ({
          ...prev,
          claimedRewards: [...prev.claimedRewards, rewardId],
          cash: prev.cash + (reward.cash > 0 ? reward.cash : 0),
        }));
        return true;
      }

      if (reward.soldierOnly && !userDoc.soldierVerified) return false;
      if (claimedRef.current.includes(rewardId)) return false;
      if (stampCountRef.current < reward.threshold) return false;
      await updateUserDocFirestore({
        claimedRewards: arrayUnion(rewardId),
        ...(reward.cash > 0 ? { cash: increment(reward.cash) } : {}),
      });
      return true;
    },
    [claimedRef, guestStateRef, isGuest, stampCountRef, uid, updateUserDocFirestore, userDoc.soldierVerified],
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      if (isGuest) {
        setGuestState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
        return Promise.resolve();
      }
      return updateUserDocFirestore(patch);
    },
    [isGuest, updateUserDocFirestore],
  );

  const setNotificationPref = useCallback(
    (key: NotificationKey, value: boolean) => {
      if (isGuest) {
        setGuestState((prev) => ({ ...prev, notificationPrefs: { ...prev.notificationPrefs, [key]: value } }));
        return Promise.resolve();
      }
      return updateUserDocFirestore({ notificationPrefs: { [key]: value } });
    },
    [isGuest, updateUserDocFirestore],
  );

  const verifySoldier = useCallback(
    (unit: string, dischargeDate: string) => {
      if (isGuest) {
        setGuestState((prev) => ({
          ...prev,
          profile: { ...prev.profile, soldierVerified: true, soldierUnit: unit, soldierDischargeDate: dischargeDate },
        }));
        return Promise.resolve();
      }
      return updateUserDocFirestore({ soldierVerified: true, soldierUnit: unit, soldierDischargeDate: dischargeDate });
    },
    [isGuest, updateUserDocFirestore],
  );

  const addCashDemo = useCallback(
    (amount: number) => {
      if (isGuest) {
        setGuestState((prev) => ({ ...prev, cash: prev.cash + amount }));
        return Promise.resolve();
      }
      return updateUserDocFirestore({ cash: increment(amount) });
    },
    [isGuest, updateUserDocFirestore],
  );

  const spendCash = useCallback(
    async (price: number): Promise<boolean> => {
      if (!uid) return false;
      if (isGuest) {
        if (guestStateRef.current.cash < price) return false;
        setGuestState((prev) => ({ ...prev, cash: prev.cash - price }));
        return true;
      }
      if (userDoc.cash < price) return false;
      await updateUserDocFirestore({ cash: increment(-price) });
      return true;
    },
    [guestStateRef, isGuest, uid, updateUserDocFirestore, userDoc.cash],
  );

  const toggleStamp = useCallback(
    async (spotId: string) => {
      if (isGuest) {
        setGuestState((prev) => {
          const owned = prev.stamps.some((stamp) => stamp.spotId === spotId);
          const stamps = owned
            ? prev.stamps.filter((stamp) => stamp.spotId !== spotId)
            : [...prev.stamps, { spotId, earnedAt: new Date().toISOString() }];
          return { ...prev, stamps };
        });
        setFreshStampId(spotId);
        return;
      }
      await stampsState.toggleStamp(spotId);
    },
    [isGuest, setFreshStampId, stampsState],
  );

  const clearStamps = useCallback(async () => {
    if (isGuest) {
      setGuestState((prev) => ({ ...prev, stamps: [] }));
      return;
    }
    await stampsState.clearStamps();
  }, [isGuest, stampsState]);

  const clearFreshStamp = useCallback(() => {
    if (isGuest) return;
    stampsState.clearFreshStamp();
  }, [isGuest, stampsState]);

  const derived = {
    cumulativeCashback: isGuest ? guestState.cash : userDoc.cumulativeCashback,
    currentTier: getTier(receipts.length),
    nextTier: getNextTier(receipts.length),
    effectiveRate: getEffectiveRate(getTier(receipts.length).rate, profile.soldierVerified),
  };

  return {
    uid,
    isGuest,
    profile,
    cash,
    receipts,
    stamps,
    freshStampId,
    ...derived,
    ...community,
    ...rideState,
    updateProfile,
    verifySoldier,
    claimedRewards,
    claimReward,
    notificationPrefs,
    setNotificationPref,
    verify,
    toggleStamp,
    clearStamps,
    clearFreshStamp,
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
