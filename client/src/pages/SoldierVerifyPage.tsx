import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { SOLDIER_CASHBACK_MULTIPLIER } from '../data';

const TOTAL_STEPS = 3;

export function SoldierVerifyPage() {
  const { verifySoldier } = useApp();
  const { back } = useNav();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [unit, setUnit] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [unitError, setUnitError] = useState<string | null>(null);
  const [dischargeError, setDischargeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUnitNext = (event: SubmitEvent) => {
    event.preventDefault();
    if (unit.trim().length < 2) {
      setUnitError('소속을 2자 이상 입력해 주세요.');
      return;
    }
    setUnitError(null);
    setStep(2);
  };

  const handleDischargeNext = (event: SubmitEvent) => {
    event.preventDefault();
    if (dischargeDate.trim() === '') {
      setDischargeError('전역예정일을 선택해 주세요.');
      return;
    }
    setDischargeError(null);
    setStep(3);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await verifySoldier(unit.trim(), dischargeDate);
    setSubmitting(false);
    showToast('군인 인증이 완료됐어요');
    back();
  };

  return (
    <div className="page">
      <ScreenHeader title="군인 인증" />
      <div className="soldier-progress" role="note" aria-label={`${step} / ${TOTAL_STEPS} 단계`}>
        <span>{step === 1 ? '1. 소속 입력' : step === 2 ? '2. 전역예정일 입력' : '3. 확인'}</span>
        <span>
          {step} / {TOTAL_STEPS}
        </span>
      </div>

      {step === 1 ? (
        <form className="page" style={{ padding: 0 }} onSubmit={handleUnitNext} noValidate>
          <p className="sub">소속을 입력해 주세요.</p>
          <Field
            label="소속"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            error={unitError}
            placeholder="예) 15사단 00연대"
            autoFocus
          />
          <div className="spacer" />
          <Button type="submit">다음</Button>
        </form>
      ) : step === 2 ? (
        <form className="page" style={{ padding: 0 }} onSubmit={handleDischargeNext} noValidate>
          <p className="sub">전역예정일을 입력해 주세요.</p>
          <Field
            label="전역예정일"
            type="date"
            value={dischargeDate}
            onChange={(event) => setDischargeDate(event.target.value)}
            error={dischargeError}
            autoFocus
          />
          <div className="spacer" />
          <div className="btn-pair">
            <Button variant="line" onClick={() => setStep(1)}>
              이전
            </Button>
            <Button type="submit">다음</Button>
          </div>
        </form>
      ) : (
        <div className="page" style={{ padding: 0 }}>
          <p className="sub">
            아래 내용으로 인증할게요. 인증하면 영수증 캐시백을 {SOLDIER_CASHBACK_MULTIPLIER}배로 받고, 스탬프 5개
            달성 시 군인 전용 쿠폰도 받을 수 있어요.
          </p>
          <dl className="info-list">
            <div>
              <dt>소속</dt>
              <dd>{unit}</dd>
            </div>
            <div>
              <dt>전역예정일</dt>
              <dd>{dischargeDate}</dd>
            </div>
          </dl>
          <p className="sm">시연용 자기입력 심사라 제출하면 바로 승인돼요. 실서비스라면 군인 신분증 확인이 필요해요.</p>
          <div className="spacer" />
          <div className="btn-pair">
            <Button variant="line" onClick={() => setStep(2)} disabled={submitting}>
              이전
            </Button>
            <Button onClick={() => void handleConfirm()} disabled={submitting}>
              {submitting ? '인증하는 중…' : '인증 완료하기'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
