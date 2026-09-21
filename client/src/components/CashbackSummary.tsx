import { useApp } from '../context/AppContext';
import { getMaxTierCount } from '../utils/cashback';
import { formatWon } from '../utils/format';
import { ProgressBar } from './ui/ProgressBar';

export function CashbackSummary() {
  const { cash, receipts, currentTier, nextTier } = useApp();
  const count = receipts.length;

  return (
    <section className="hero" aria-label="내 캐시 요약">
      <div className="hero__label">내 캐시</div>
      <div className="hero__amount">{formatWon(cash)}</div>
      <div className="hero__meta">
        {count}번 인증 · 현재 <b>{currentTier.rate}%</b> 캐시백
      </div>
      <ProgressBar value={count} max={getMaxTierCount()} label="캐시백 등급 진행률" tone="onBrand" />
      <div className="hero__next">
        {nextTier
          ? `${nextTier.minCount - count}번 더 인증하면 ${nextTier.rate}%로 올라가요`
          : `최고 등급이에요 · ${currentTier.rate}% 적용 중`}
      </div>
    </section>
  );
}
