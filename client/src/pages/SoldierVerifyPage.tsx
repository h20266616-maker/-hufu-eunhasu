import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';

export function SoldierVerifyPage() {
  const { verifySoldier } = useApp();
  const { back } = useNav();
  const showToast = useToast();
  const [unit, setUnit] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [errors, setErrors] = useState<{ unit?: string; dischargeDate?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (unit.trim().length < 2) next.unit = '소속을 2자 이상 입력해 주세요.';
    if (dischargeDate.trim() === '') next.dischargeDate = '전역예정일을 선택해 주세요.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    await verifySoldier(unit.trim(), dischargeDate);
    setSubmitting(false);
    showToast('군인 인증이 완료됐어요');
    back();
  };

  return (
    <form className="page" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <ScreenHeader title="군인 인증" />
      <p className="sub">
        소속과 전역예정일을 입력하면 바로 인증돼요.
        <br />
        인증하면 영수증 캐시백을 1.5배로 받고, 스탬프 5개 달성 시 군인 전용 쿠폰도 받을 수 있어요.
      </p>
      <Field
        label="소속"
        value={unit}
        onChange={(event) => setUnit(event.target.value)}
        error={errors.unit}
        placeholder="예) 15사단 00연대"
        disabled={submitting}
      />
      <Field
        label="전역예정일"
        type="date"
        value={dischargeDate}
        onChange={(event) => setDischargeDate(event.target.value)}
        error={errors.dischargeDate}
        disabled={submitting}
      />
      <p className="sm">시연용 자기입력 심사라 제출하면 바로 승인돼요. 실서비스라면 군인 신분증 확인이 필요해요.</p>
      <div className="spacer" />
      <Button type="submit" disabled={submitting}>
        {submitting ? '인증하는 중…' : '인증 신청하기'}
      </Button>
    </form>
  );
}
