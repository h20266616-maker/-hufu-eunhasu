import { CASHBACK_TIERS } from '../data';
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
