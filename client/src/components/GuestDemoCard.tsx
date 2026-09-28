import { RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { GUEST_TOPUP_CASHBACK, STAMP_SPOTS } from '../data';
import type { Role } from '../types';
import { formatWon } from '../utils/format';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { SegmentControl } from './ui/SegmentControl';
import { Toggle } from './ui/Toggle';

const ROLE_OPTIONS: readonly { value: Role; label: string }[] = [
  { value: 'traveler', label: '여행자' },
  { value: 'owner', label: '상점 사장님' },
];

/** 발표 시연용 카드. 체험(익명) 계정에서만 보이고, 기능 제한과는 무관하다 */
export function GuestDemoCard() {
  const { profile, stamps, updateProfile, verifySoldier, addCashDemo, toggleStamp, resetGuestData } = useApp();
  const showToast = useToast();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const nextStampSpot = STAMP_SPOTS.find((spot) => !stamps.some((stamp) => stamp.spotId === spot.id));

  const handleSoldierToggle = async (next: boolean) => {
    if (next) {
      await verifySoldier('체험 부대', '2099-12-31');
      showToast('군인 인증을 바로 적용했어요');
    } else {
      await updateProfile({ soldierVerified: false, soldierUnit: '', soldierDischargeDate: '' });
      showToast('군인 인증을 해제했어요');
    }
  };

  const handleRoleChange = async (role: Role) => {
    await updateProfile({ role });
    showToast(role === 'owner' ? '사장님 회원으로 전환했어요' : '여행자 회원으로 전환했어요');
  };

  const handleTopUp = async () => {
    await addCashDemo(GUEST_TOPUP_CASHBACK);
    showToast(`캐시백 ${formatWon(GUEST_TOPUP_CASHBACK)}을 충전했어요`);
  };

  const handleStamp = async () => {
    if (!nextStampSpot) {
      showToast('이미 모든 스탬프를 모았어요');
      return;
    }
    await toggleStamp(nextStampSpot.id);
    showToast(`${nextStampSpot.name} 스탬프를 찍었어요`);
  };

  const handleReset = async () => {
    setBusy(true);
    await resetGuestData();
    setBusy(false);
    setConfirmingReset(false);
    showToast('체험 계정 데이터를 초기화했어요');
  };

  return (
    <Card className="guest-demo">
      <div className="row">
        <strong>
          <Sparkles size={16} aria-hidden="true" /> 시연 도우미
        </strong>
        <span className="tag tag--soldier">체험용 기능이에요</span>
      </div>
      <p className="sm">발표·시연 중에 상태를 빠르게 바꿔볼 수 있어요.</p>

      <div className="row">
        <span className="sm">군인 인증 바로 적용</span>
        <Toggle checked={profile.soldierVerified} onChange={(next) => void handleSoldierToggle(next)} label="군인 인증 바로 적용" />
      </div>

      <div className="field">
        <span className="field__label">회원 유형 전환</span>
        <SegmentControl options={ROLE_OPTIONS} value={profile.role} onChange={(value) => void handleRoleChange(value)} ariaLabel="회원 유형 전환" />
      </div>

      <div className="btn-pair">
        <Button variant="line" onClick={() => void handleTopUp()}>
          캐시백 {formatWon(GUEST_TOPUP_CASHBACK)} 충전
        </Button>
        <Button variant="line" onClick={() => void handleStamp()}>
          스탬프 하나 찍기
        </Button>
      </div>

      {confirmingReset ? (
        <Card className="guest-demo__confirm">
          <strong>내 데이터를 초기화할까요?</strong>
          <p className="sm">이 체험 계정의 캐시백·스탬프·영수증 기록이 모두 사라져요. 되돌릴 수 없어요.</p>
          <div className="btn-pair">
            <Button variant="line" onClick={() => setConfirmingReset(false)} disabled={busy}>
              취소
            </Button>
            <Button onClick={() => void handleReset()} disabled={busy}>
              {busy ? '초기화하는 중…' : '초기화하기'}
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="ghost" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={() => setConfirmingReset(true)}>
          내 데이터 초기화
        </Button>
      )}
    </Card>
  );
}
