import { useApp } from '../context/AppContext';
import { getEffectiveRate, getMaxTierCount } from '../utils/cashback';
import { formatWon } from '../utils/format';
import { CashbackBreakdown } from './CashbackBreakdown';
import { ProgressBar } from './ui/ProgressBar';

export function CashbackSummary() {
  const { currentCashback, totalCashback, usedCashback, receipts, currentTier, nextTier, profile } = useApp();
  const count = receipts.length;
  const effectiveRate = getEffectiveRate(currentTier.rate, profile.soldierVerified);
  const nextEffectiveRate = nextTier ? getEffectiveRate(nextTier.rate, profile.soldierVerified) : null;

  return (
    <section className="hero" aria-label="내 캐시 요약">
      <div className="hero__label">현재 캐시백</div>
      <div className="hero__amount">{formatWon(currentCashback)}</div>
      <CashbackBreakdown total={totalCashback} current={currentCashback} used={usedCashback} tone="onBrand" />
      <div className="hero__meta">
        {count}번 인증 · 현재 <b>{effectiveRate}%</b> 캐시백
        {profile.soldierVerified ? ' (군인 1.5배 적용)' : ''}
      </div>
      <ProgressBar value={count} max={getMaxTierCount()} label="캐시백 등급 진행률" tone="onBrand" />
      <div className="hero__next">
        {nextTier && nextEffectiveRate !== null
          ? `${nextTier.minCount - count}번 더 인증하면 ${nextEffectiveRate}%로 올라가요`
          : `최고 등급이에요 · ${effectiveRate}% 적용 중`}
      </div>
    </section>
  );
}
