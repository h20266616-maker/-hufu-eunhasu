import { Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/StateMessage';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { formatDateTime, formatWon } from '../utils/format';

export function ReceiptHistoryPage() {
  const { receipts } = useApp();
  const { switchTab } = useNav();
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  return (
    <div className="page">
      <ScreenHeader title="내 영수증 내역" />
      {receipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="인증한 영수증이 없어요"
          description="영수증을 인증하면 이곳에 기록돼요."
          action={<Button onClick={() => switchTab('receipt')}>영수증 인증하러 가기</Button>}
        />
      ) : (
        <ul className="plain-list">
          {receipts.map((receipt) => (
            <li key={receipt.id}>
              <Card className="row">
                <div className="receipt-row__main">
                  {receipt.imageUrl ? (
                    <button
                      type="button"
                      className="receipt-thumb"
                      aria-label={`${receipt.shop} 영수증 사진 크게 보기`}
                      onClick={() => setViewingImage(receipt.imageUrl ?? null)}
                    >
                      <img src={receipt.imageUrl} alt="" />
                    </button>
                  ) : null}
                  <div>
                    <strong>{receipt.shop}</strong>
                    <div className="sm">
                      {formatDateTime(receipt.createdAt)} · {receipt.category} · {receipt.source === 'cash' ? '현금 QR' : '사진'}
                    </div>
                    <div className="sm">
                      {formatWon(receipt.amount)}의 {receipt.rate}%
                    </div>
                  </div>
                </div>
                <Tag>+{formatWon(receipt.cashback)}</Tag>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {viewingImage ? (
        <div className="image-viewer" role="dialog" aria-modal="true" aria-label="영수증 사진">
          <button type="button" className="image-viewer__close" aria-label="닫기" onClick={() => setViewingImage(null)}>
            <X size={22} aria-hidden="true" />
          </button>
          <img src={viewingImage} alt="영수증 사진" />
        </div>
      ) : null}
    </div>
  );
}
