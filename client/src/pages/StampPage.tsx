import { Stamp } from 'lucide-react';
import { useEffect } from 'react';
import { RewardCard } from '../components/RewardCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { StampSlot } from '../components/StampSlot';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/StateMessage';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { STAMP_REWARDS, STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

const FRESH_STAMP_VISIBLE_MS = 1600;

export function StampPage() {
  const { stamps, freshStampId, clearFreshStamp, claimedRewards, claimReward } = useApp();
  const { switchTab } = useNav();
  const showToast = useToast();
  const total = STAMP_SPOTS.length;

  useEffect(() => {
    const timer = window.setTimeout(clearFreshStamp, FRESH_STAMP_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [clearFreshStamp]);

  const handleClaim = (rewardId: string) => {
    const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
    if (!reward || !claimReward(rewardId)) {
      showToast('아직 받을 수 없는 보상이에요');
      return;
    }
    showToast(reward.cash > 0 ? `${reward.title} ${formatWon(reward.cash)}이 캐시로 지급됐어요` : `${reward.title}를 받았어요`);
  };

  return (
    <div className="page">
      <ScreenHeader title="스탬프북" showBack={false} />

      <section className="stamp-progress" aria-label="스탬프 진행률">
        <div className="row">
          <strong>화천 스탬프 투어</strong>
          <span className="stamp-progress__count">
            {stamps.length} / {total}
          </span>
        </div>
        <ProgressBar value={stamps.length} max={total} label="스탬프 수집 진행률" />
      </section>

      {stamps.length === 0 ? (
        <EmptyState
          icon={Stamp}
          title="아직 찍은 스탬프가 없어요"
          description="영수증을 인증하면 스탬프가 자동으로 찍혀요."
          action={<Button onClick={() => switchTab('receipt')}>영수증 인증하러 가기</Button>}
        />
      ) : null}

      <ul className="stampbook" aria-label="스탬프 목록">
        {STAMP_SPOTS.map((spot) => (
          <StampSlot
            key={spot.id}
            spot={spot}
            record={stamps.find((stamp) => stamp.spotId === spot.id)}
            fresh={freshStampId === spot.id}
          />
        ))}
      </ul>

      <section aria-labelledby="reward-title">
        <h2 id="reward-title" className="section-title">
          달성 보상
        </h2>
        {STAMP_REWARDS.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            stampCount={stamps.length}
            claimed={claimedRewards.includes(reward.id)}
            onClaim={handleClaim}
          />
        ))}
      </section>
    </div>
  );
}
