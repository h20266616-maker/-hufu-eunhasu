import { SAMPLE_RECEIPT } from '../data';
import { formatWon } from '../utils/format';
import { Spinner } from './ui/Spinner';

function SampleReceipt() {
  const total = SAMPLE_RECEIPT.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return (
    <div className="receipt-sample">
      <p className="receipt-sample__badge">예시 영수증</p>
      <p className="receipt-sample__shop">{SAMPLE_RECEIPT.shop}</p>
      <p className="receipt-sample__addr">{SAMPLE_RECEIPT.address}</p>
      <hr />
      <ul>
        {SAMPLE_RECEIPT.lines.map((line) => (
          <li key={line.name}>
            <span>
              {line.name} x{line.qty}
            </span>
            <span>{(line.price * line.qty).toLocaleString('ko-KR')}</span>
          </li>
        ))}
      </ul>
      <hr />
      <p className="receipt-sample__total">
        <span>합계</span>
        <span>{formatWon(total)}</span>
      </p>
      <p className="receipt-sample__addr">{SAMPLE_RECEIPT.cardNote}</p>
      <div className="receipt-sample__barcode" aria-hidden="true" />
      <p className="receipt-sample__addr">이용해 주셔서 감사합니다</p>
    </div>
  );
}

interface ReceiptPaperProps {
  imageUrl: string | null;
  loading: boolean;
}

export function ReceiptPaper({ imageUrl, loading }: ReceiptPaperProps) {
  return (
    <div className="receipt-stage" tabIndex={0} role="region" aria-label="영수증 미리보기, 위아래로 스크롤할 수 있어요">
      <div className="receipt-shadow">
        <div className={`receipt-paper${imageUrl ? ' receipt-paper--photo' : ''}`}>
          {imageUrl ? <img src={imageUrl} alt="선택한 영수증 사진" /> : <SampleReceipt />}
          {loading ? (
            <div className="receipt-scan">
              <Spinner label="영수증을 읽는 중…" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
