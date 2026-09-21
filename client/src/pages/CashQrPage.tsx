import { QrCode } from 'lucide-react';
import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { ErrorState } from '../components/ui/StateMessage';
import { Spinner } from '../components/ui/Spinner';
import { CASH_QR_STORE, MAX_RECEIPT_AMOUNT } from '../data';
import { useVerifyFlow } from '../hooks/useVerifyFlow';
import { formatWon, parseAmount } from '../utils/format';

export function CashQrPage() {
  const { status, errorMessage, submit } = useVerifyFlow();
  const [amountText, setAmountText] = useState(String(CASH_QR_STORE.defaultAmount));
  const [amountError, setAmountError] = useState<string | null>(null);
  const loading = status === 'loading';

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const amount = parseAmount(amountText);
    if (amount <= 0) {
      setAmountError('결제 금액을 입력해 주세요.');
      return;
    }
    if (amount > MAX_RECEIPT_AMOUNT) {
      setAmountError(`${formatWon(MAX_RECEIPT_AMOUNT)} 이하로 입력해 주세요.`);
      return;
    }
    setAmountError(null);
    void submit({
      source: 'cash',
      shop: CASH_QR_STORE.shop,
      amount,
      category: CASH_QR_STORE.category,
      stampId: CASH_QR_STORE.stampId,
    });
  };

  return (
    <form className="page" onSubmit={handleSubmit} noValidate>
      <ScreenHeader title="현금 결제 인증" />
      <p className="sub">
        가게에 비치된 QR을 찍고 결제 금액을 입력하면,
        <br />
        사장님이 확인 버튼을 눌러 인증됩니다.
      </p>
      <Card className="cash-store">
        <span className="cash-store__icon">
          <QrCode size={22} aria-hidden="true" />
        </span>
        <div>
          <strong>{CASH_QR_STORE.name}</strong>
          <div className="sm">QR 스캔 완료 (시연)</div>
        </div>
      </Card>
      <Field
        label="결제 금액 (원)"
        value={amountText}
        onChange={(event) => setAmountText(event.target.value)}
        error={amountError}
        inputMode="numeric"
        placeholder="결제 금액"
        disabled={loading}
      />
      {loading ? <Spinner label="사장님 확인을 기다리는 중…" /> : null}
      {status === 'error' && errorMessage ? <ErrorState title="확인에 실패했어요" description={errorMessage} /> : null}
      <div className="spacer" />
      <Button type="submit" disabled={loading}>
        {loading ? '확인 요청 중…' : '사장님께 확인 요청'}
      </Button>
    </form>
  );
}
