import { arrayUnion, increment } from 'firebase/firestore';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { GUEST_SEED_STAMP_SPOT_IDS, MOCK_RECEIPTS, STAMP_REWARDS, VERIFY_LATENCY_MS } from '../data';
import { useAuth } from './AuthContext';
import { useCommunity } from '../hooks/useCommunity';
import { useLatest } from '../hooks/useLatest';
import { useReceipts } from '../hooks/useReceipts';
import { useRide } from '../hooks/useRide';
import { useStamps } from '../hooks/useStamps';
import { useUserDoc } from '../hooks/useUserDoc';
import type { NotificationKey, Profile, ReceiptCategory, ReceiptForm, ReceiptRecord, StampSpot } from '../types';
import { getEffectiveRate, getNextTier, getTier } from '../utils/cashback';
import { guestNicknameFor } from '../utils/guest';
import { randomBetween, wait } from '../utils/format';

export type VerifyInput =
  | { source: 'photo'; imageUrl?: string; category: ReceiptCategory; receiptForm: ReceiptForm }
  | { source: 'cash'; shop: string; amount: number; category: ReceiptCategory; stampId: string };

export type VerifyOutcome =
  | { ok: true; receipt: ReceiptRecord; stamp: StampSpot | null; unlockedRewardIds: string[] }
  | { ok: false; message: string };

const VERIFY_FAILURE_MESSAGE = '영수증을 읽지 못했어요. 밝은 곳에서 평평하게 펴서 다시 촬영해 주세요.';
const LOGIN_REQUIRED_MESSAGE = '로그인하고 인증해 주세요.';
const DUPLICATE_RECEIPT_MESSAGE = '이미 인증된 영수증이에요.';

/**
 * mock 중복 인증 판별용 키. 가맹점명 + 금액 + 날짜(일 단위)를 합쳐서 만든다.
 * 실서비스라면 이 정도로는 부족하고 OCR로 읽은 영수증 번호, 가맹점 사업자번호 DB 대조,
 * 카드사·PG 결제 데이터 대사가 필요하다. README의 "영수증 중복 인증 방지" 절 참고.
 */
function buildReceiptDedupeKey(shop: string, amount: number, createdAt: string): string {
  return `${shop}|${amount}|${createdAt.slice(0, 10)}`;
}

function useAppState() {
  const { user, isGuest } = useAuth();
  const uid = user?.uid ?? null;

  // 체험(익명) 계정도 실제 Firebase 사용자라 이제 모든 계정이 같은 Firestore 훅을 그대로 쓴다.
  // isGuest는 닉네임 기본값·초기 샘플 데이터를 고를 때만 쓰고, 기능을 막는 데는 쓰지 않는다
  const { data: profile, update: updateUserDoc } = useUserDoc(uid, {
    nickname: isGuest && uid ? guestNicknameFor(uid) : (user?.displayName ?? undefined),
    email: user?.email ?? undefined,
    isGuest,
  });
  const { receipts, commitReceipt, deleteAllMyReceipts } = useReceipts(uid);
  const stampsState = useStamps(uid, isGuest ? GUEST_SEED_STAMP_SPOT_IDS : undefined);
  const community = useCommunity(uid, isGuest);
  const rideState = useRide();
  const mockCursor = useRef(0);

  const [failNextVerify, setFailNextVerify] = useState(false);
  const failNextRef = useLatest(failNextVerify);

  const { currentCashback, totalCashback, usedCashback, claimedRewards, notificationPrefs } = profile;
  const { stamps, freshStampId, awardStamp, toggleStamp, clearStamps, clearFreshStamp } = stampsState;

  const claimedRef = useLatest(claimedRewards);
  const receiptsRef = useLatest(receipts);
  const stampCountRef = useLatest(stamps.length);

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
      // 사진 인증은 아직 실제 OCR이 없어서 가게·금액은 예시 데이터를 쓰지만,
      // 카테고리는 본인이 고른 값이 실제 지출과 더 맞으니 그대로 반영한다
      const resolved = input.source === 'cash' ? input : mock ? { ...mock, category: input.category } : null;
      if (!resolved) return { ok: false, message: VERIFY_FAILURE_MESSAGE };

      // mock 중복 인증 방지: 같은 가게에서 같은 금액을 같은 날 두 번 인증하면 막는다
      const dedupeKey = buildReceiptDedupeKey(resolved.shop, resolved.amount, new Date().toISOString());
      const isDuplicate = receiptsRef.current.some(
        (existing) => buildReceiptDedupeKey(existing.shop, existing.amount, existing.createdAt) === dedupeKey,
      );
      if (isDuplicate) return { ok: false, message: DUPLICATE_RECEIPT_MESSAGE };

      try {
        const receipt = await commitReceipt(
          {
            shop: resolved.shop,
            amount: resolved.amount,
            category: resolved.category,
            source: input.source,
            ...(input.source === 'photo' && input.imageUrl ? { imageUrl: input.imageUrl } : {}),
            ...(input.source === 'photo' ? { receiptForm: input.receiptForm } : {}),
          },
          profile.soldierVerified,
        );
        const awarded = await awardStamp(resolved.stampId);
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
    [awardStamp, commitReceipt, failNextRef, profile.soldierVerified, receiptsRef, uid],
  );

  const claimReward = useCallback(
    async (rewardId: string): Promise<boolean> => {
      const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
      if (!reward || !uid) return false;
      if (reward.soldierOnly && !profile.soldierVerified) return false;
      if (claimedRef.current.includes(rewardId)) return false;
      if (stampCountRef.current < reward.threshold) return false;
      await updateUserDoc({
        claimedRewards: arrayUnion(rewardId),
        ...(reward.cash > 0 ? { currentCashback: increment(reward.cash), totalCashback: increment(reward.cash) } : {}),
      });
      return true;
    },
    [claimedRef, profile.soldierVerified, stampCountRef, uid, updateUserDoc],
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

  const addCashDemo = useCallback(
    (amount: number) => updateUserDoc({ currentCashback: increment(amount), totalCashback: increment(amount) }),
    [updateUserDoc],
  );

  const spendCash = useCallback(
    async (price: number): Promise<boolean> => {
      if (!uid) return false;
      if (currentCashback < price) return false;
      await updateUserDoc({ currentCashback: increment(-price), usedCashback: increment(price) });
      return true;
    },
    [currentCashback, uid, updateUserDoc],
  );

  // 시연 도우미 > 내 데이터 초기화. firestore.rules가 체험(익명) 계정의 본인 영수증
  // 삭제만 허용해서, 실제 계정에서 잘못 호출돼도 규칙 단에서 막힌다
  const resetGuestData = useCallback(async () => {
    if (!uid || !isGuest) return;
    await Promise.all([
      deleteAllMyReceipts(),
      clearStamps(),
      updateUserDoc({ currentCashback: 0, totalCashback: 0, usedCashback: 0, claimedRewards: [] }),
    ]);
  }, [clearStamps, deleteAllMyReceipts, isGuest, uid, updateUserDoc]);

  const derived = {
    currentTier: getTier(receipts.length),
    nextTier: getNextTier(receipts.length),
    effectiveRate: getEffectiveRate(getTier(receipts.length).rate, profile.soldierVerified),
  };

  return {
    uid,
    isGuest,
    profile,
    currentCashback,
    totalCashback,
    usedCashback,
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
    resetGuestData,
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
