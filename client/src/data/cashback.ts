import type { CashbackTier, ReceiptCategory } from '../types';

export const CASHBACK_TIERS: readonly CashbackTier[] = [
  { minCount: 0, rate: 10 },
  { minCount: 1, rate: 15 },
  { minCount: 3, rate: 20 },
  { minCount: 5, rate: 30 },
];

export const RECEIPT_CATEGORIES: readonly ReceiptCategory[] = ['식비', '체험', '숙박', '특산물'];

export const CASH_QR_STORE = {
  name: '화천중앙시장 · 옛골식당',
  shop: '화천중앙시장 옛골식당',
  category: '식비' as ReceiptCategory,
  defaultAmount: 18000,
  stampId: 'joongang-market',
};

export const MAX_RECEIPT_AMOUNT = 1_000_000;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const VERIFY_LATENCY_MS = { min: 1200, max: 1900 };

/** 군인 인증 회원의 캐시백 배율. 값만 바꾸면 전체 계산에 반영돼요 */
export const SOLDIER_CASHBACK_MULTIPLIER = 1.5;
