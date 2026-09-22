import { LogIn, Stamp } from 'lucide-react';
import { useEffect } from 'react';
import { RewardCard } from '../components/RewardCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { StampSlot } from '../components/StampSlot';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/StateMessage';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { STAMP_REWARDS, STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

const FRESH_STAMP_VISIBLE_MS = 1600;

export function StampPage() {
  const { uid, profile, stamps, freshStampId, clearFreshStamp, claimedRewards, claimReward } = useApp();
  const { push, switchTab } = useNav();
  const showToast = useToast();
  const total = STAMP_SPOTS.length;
  const loggedIn = uid !== null;
  const visibleRewards = STAMP_REWARDS.filter((reward) => !reward.soldierOnly || profile.soldierVerified);

  useEffect(() => {
    const timer = window.setTimeout(clearFreshStamp, FRESH_STAMP_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [clearFreshStamp]);

  const handleClaim = async (rewardId: string) => {
    const reward = STAMP_REWARDS.find((item) => item.id === rewardId);
    const claimed = reward ? await claimReward(rewardId) : false;
    if (!reward || !claimed) {
      showToast('아직 받을 수 없는 보상이에요');
      return;
    }
    showToast(reward.cash > 0 ? `${reward.title} ${formatWon(reward.cash)}이 캐시로 지급됐어요` : `${reward.title}를 받았어요`);
  };

  return (
    <div className="page">
      <ScreenHeader title="스탬프북" showBack={false} />

      {loggedIn ? null : (
        <Card className="row">
          <div>
            <strong>로그인하고 스탬프를 모아보세요</strong>
            <div className="sm">모은 스탬프는 계정에 안전하게 저장돼요</div>
          </div>
          <Button className="btn--small" icon={<LogIn size={16} aria-hidden="true" />} onClick={() => push({ name: 'login' })}>
            로그인
          </Button>
        </Card>
      )}

      <section className="stamp-progress" aria-label="스탬프 진행률">
        <div className="row">
          <strong>화천 스탬프 투어</strong>
          <span className="stamp-progress__count">
            {stamps.length} / {total}
          </span>
        </div>
        <ProgressBar value={stamps.length} max={total} label="스탬프 수집 진행률" />
      </section>

      {loggedIn && stamps.length === 0 ? (
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
        {visibleRewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            stampCount={stamps.length}
            claimed={claimedRewards.includes(reward.id)}
            onClaim={(id) => void handleClaim(id)}
          />
        ))}
      </section>
    </div>
  );
}
