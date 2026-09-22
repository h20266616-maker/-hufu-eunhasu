import { CASHBACK_TIERS, SOLDIER_CASHBACK_MULTIPLIER } from '../data';
import type { CashbackTier } from '../types';

export function getTier(verifiedCount: number): CashbackTier {
  let current: CashbackTier = CASHBACK_TIERS[0] ?? { minCount: 0, rate: 0 };
  for (const tier of CASHBACK_TIERS) {
    if (verifiedCount >= tier.minCount) current = tier;
  }
  return current;
}

export function getNextTier(verifiedCount: number): CashbackTier | null {
  return CASHBACK_TIERS.find((tier) => tier.minCount > verifiedCount) ?? null;
}

export function getMaxTierCount(): number {
  return CASHBACK_TIERS[CASHBACK_TIERS.length - 1]?.minCount ?? 1;
}

export function calcCashback(amount: number, rate: number): number {
  return Math.round((amount * rate) / 100);
}

/** 군인 인증 회원이면 기본 등급 캐시백률에 배율을 곱한다 */
export function getEffectiveRate(baseRate: number, isSoldier: boolean): number {
  return isSoldier ? Math.round(baseRate * SOLDIER_CASHBACK_MULTIPLIER * 10) / 10 : baseRate;
}
