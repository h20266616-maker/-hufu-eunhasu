import { BadgeCheck, Gift } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AppIcon } from '../components/AppIcon';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/StateMessage';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { STAMP_REWARDS, STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

interface VerifyResultPageProps {
  receiptId: string;
  stampId: string | null;
  rewardIds: string[];
}

export function VerifyResultPage({ receiptId, stampId, rewardIds }: VerifyResultPageProps) {
  const { receipts, cash, currentTier, nextTier } = useApp();
  const { switchTab } = useNav();
  const reduceMotion = useReducedMotion();

  const receipt = receipts.find((item) => item.id === receiptId);
  const spot = STAMP_SPOTS.find((item) => item.id === stampId);
  const rewards = STAMP_REWARDS.filter((reward) => rewardIds.includes(reward.id));

  if (!receipt) {
    return (
      <div className="page">
        <ErrorState
          title="인증 내역을 찾을 수 없어요"
          description="처음 화면에서 다시 시도해 주세요."
          action={<Button onClick={() => switchTab('receipt')}>영수증 인증으로 가기</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="result-hero">
        <span className="result-hero__icon">
          <BadgeCheck size={34} aria-hidden="true" />
        </span>
        <p className="result-hero__label">인증 완료</p>
        <p className="big" aria-label={`캐시백 ${formatWon(receipt.cashback)} 적립`}>
          +{formatWon(receipt.cashback)}
        </p>
        <p className="mid">
          {receipt.shop} · {formatWon(receipt.amount)}의 {receipt.rate}%
        </p>
        <Tag>{receipt.category}</Tag>
      </div>

      {spot ? (
        <Card className="stamp-earned">
          <motion.div
            className="stamp-slot__circle stamp-slot__circle--earned"
            initial={reduceMotion ? false : { scale: 2.4, rotate: -34, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 15, delay: 0.25 }}
          >
            <AppIcon name={spot.icon} size={30} strokeWidth={2.2} />
          </motion.div>
          <div>
            <strong>스탬프 1개 적립</strong>
            <div className="sm">{spot.name}</div>
          </div>
        </Card>
      ) : (
        <Card>
          <strong>스탬프를 모두 모았어요</strong>
          <div className="sm">더 이상 찍을 스탬프가 없어요.</div>
        </Card>
      )}

      {rewards.map((reward) => (
        <Card key={reward.id} className="reward reward--unlocked">
          <div className="reward__head">
            <span className="reward__icon">
              <Gift size={22} aria-hidden="true" />
            </span>
            <div className="reward__text">
              <strong>보상 달성! {reward.title}</strong>
              <p className="sm">스탬프 탭에서 받을 수 있어요</p>
            </div>
          </div>
          <Button variant="line" onClick={() => switchTab('stamp')}>
            스탬프북 열기
          </Button>
        </Card>
      ))}

      <Card className="row">
        <div>
          <strong>다음 인증부터</strong>
          <div className="sm">
            {nextTier ? `${nextTier.minCount - receipts.length}번 더 인증하면 ${nextTier.rate}%` : '최고 등급 적용 중'}
          </div>
        </div>
        <Tag>{currentTier.rate}%</Tag>
      </Card>
      <Card className="row">
        <div>
          <strong>내 캐시</strong>
          <div className="sm">특산물 상점에서 바로 사용 가능</div>
        </div>
        <Tag>{formatWon(cash)}</Tag>
      </Card>

      <div className="spacer" />
      <Button onClick={() => switchTab('shop')}>캐시 쓰러 가기</Button>
      <Button variant="ghost" onClick={() => switchTab('receipt')}>
        홈으로
      </Button>
    </div>
  );
}
