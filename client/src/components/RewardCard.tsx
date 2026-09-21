import { Award, Check, Gift } from 'lucide-react';
import type { StampReward } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';

interface RewardCardProps {
  reward: StampReward;
  stampCount: number;
  claimed: boolean;
  onClaim: (rewardId: string) => void;
}

export function RewardCard({ reward, stampCount, claimed, onClaim }: RewardCardProps) {
  const unlocked = stampCount >= reward.threshold;
  const Icon = reward.kind === 'badge' ? Award : Gift;

  return (
    <Card className={`reward${unlocked ? ' reward--unlocked' : ''}`}>
      <div className="reward__head">
        <span className="reward__icon">
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="reward__text">
          <strong>{reward.title}</strong>
          <p className="sm">{reward.description}</p>
        </div>
      </div>
      {claimed ? (
        <p className="reward__done">
          <Check size={16} aria-hidden="true" /> 받기 완료
        </p>
      ) : unlocked ? (
        <Button onClick={() => onClaim(reward.id)}>{reward.kind === 'badge' ? '배지 받기' : '쿠폰 받기'}</Button>
      ) : (
        <div className="reward__progress">
          <ProgressBar value={stampCount} max={reward.threshold} label={`${reward.title} 달성 진행률`} />
          <span className="sm">
            {stampCount} / {reward.threshold}개
          </span>
        </div>
      )}
    </Card>
  );
}
