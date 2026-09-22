import { formatWon } from '../utils/format';

interface CashbackBreakdownProps {
  total: number;
  current: number;
  used: number;
  tone?: 'onBrand' | 'default';
}

/** 누적/현재/사용 캐시백 세 값을 한 줄로 보여준다. 홈 화면 hero와 MY 프로필 카드에서 함께 쓴다 */
export function CashbackBreakdown({ total, current, used, tone = 'default' }: CashbackBreakdownProps) {
  return (
    <dl className={`cashback-breakdown${tone === 'onBrand' ? ' cashback-breakdown--on-brand' : ''}`}>
      <div>
        <dt>누적 캐시백</dt>
        <dd>{formatWon(total)}</dd>
      </div>
      <div>
        <dt>현재 캐시백</dt>
        <dd>{formatWon(current)}</dd>
      </div>
      <div>
        <dt>사용 캐시백</dt>
        <dd>{formatWon(used)}</dd>
      </div>
    </dl>
  );
}
