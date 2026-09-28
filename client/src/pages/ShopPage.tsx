import { ChevronRight, ExternalLink, Wallet } from 'lucide-react';
import { useState } from 'react';
import { AppIcon } from '../components/AppIcon';
import { BottomSheet } from '../components/BottomSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card, CardButton } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { EXTERNAL_STORES, MAX_RECEIPT_AMOUNT, PRODUCTS } from '../data';
import type { ExternalStore } from '../data/stores';
import type { Product } from '../types';
import { formatWon, parseAmount } from '../utils/format';

export function ShopPage() {
  const { currentCashback, spendCash } = useApp();
  const showToast = useToast();
  const [selected, setSelected] = useState<Product | null>(null);
  const [payingStore, setPayingStore] = useState<ExternalStore | null>(null);
  const [payAmountText, setPayAmountText] = useState('');
  const [payAmountError, setPayAmountError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const shortage = selected ? Math.max(0, selected.price - currentCashback) : 0;

  const handleOrder = async () => {
    if (!selected) return;
    if (!(await spendCash(selected.price))) {
      showToast(`캐시가 ${formatWon(selected.price - currentCashback)} 부족해요`);
      return;
    }
    showToast(`${selected.name} 주문 완료`);
    setSelected(null);
  };

  const openPay = (store: ExternalStore) => {
    setPayingStore(store);
    setPayAmountText('');
    setPayAmountError(null);
  };

  const closePay = () => {
    setPayingStore(null);
    setPayAmountText('');
    setPayAmountError(null);
  };

  const handlePay = async () => {
    if (!payingStore) return;
    const amount = parseAmount(payAmountText);
    if (amount <= 0) {
      setPayAmountError('결제 금액을 입력해 주세요.');
      return;
    }
    if (amount > MAX_RECEIPT_AMOUNT) {
      setPayAmountError(`${formatWon(MAX_RECEIPT_AMOUNT)} 이하로 입력해 주세요.`);
      return;
    }
    if (amount > currentCashback) {
      setPayAmountError(`캐시백이 ${formatWon(amount - currentCashback)} 부족해요.`);
      return;
    }
    setPaying(true);
    const ok = await spendCash(amount);
    setPaying(false);
    if (!ok) {
      setPayAmountError(`캐시백이 ${formatWon(amount - currentCashback)} 부족해요.`);
      return;
    }
    showToast(`${payingStore.name} 체험 결제 완료 (실제 결제 아님)`);
    closePay();
  };

  return (
    <div className="page">
      <ScreenHeader title="온라인 상점" showBack={false} />
      <p className="sub">화천 대표 브랜드를 스마트스토어에서 만나보세요. 캐시백으로 결제할 수 있어요.</p>
      <Card className="row">
        <div>
          <strong>사용 가능한 캐시</strong>
          <div className="sm">화천에 다시 오지 않아도 쓸 수 있어요</div>
        </div>
        <Tag>{formatWon(currentCashback)}</Tag>
      </Card>

      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.id}>
            <CardButton
              className="product"
              onClick={() => setSelected(product)}
              aria-label={`${product.name}, ${formatWon(product.price)}, 주문하기`}
            >
              <span className="product__icon">
                <AppIcon name={product.icon} size={24} />
              </span>
              <span className="product__text">
                <strong>{product.name}</strong>
                <span className="sm">{product.description}</span>
              </span>
              <Tag>{formatWon(product.price)}</Tag>
              <ChevronRight size={18} aria-hidden="true" />
            </CardButton>
          </li>
        ))}
      </ul>

      <section aria-labelledby="store-title">
        <h2 id="store-title" className="section-title">
          화천 농가 스토어 바로가기
        </h2>
        <p className="sub">캐시가 부족해도 화천 농가·소상공인 스마트스토어에서 바로 구매할 수 있어요.</p>
        <ul className="store-list">
          {EXTERNAL_STORES.map((store) => (
            <li key={store.id}>
              <Card className="store-card">
                <div className="store-card__head">
                  <span className="store-card__initial" aria-hidden="true">
                    {store.name.charAt(0)}
                  </span>
                  <div>
                    <strong>{store.name}</strong>
                    <p className="sm">{store.tagline}</p>
                  </div>
                </div>
                <p className="sm">캐시백 사용 가능</p>
                <div className="btn-pair">
                  <a
                    className="btn btn--line"
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${store.name} 스토어 바로가기, 새 탭으로 열림`}
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                    <span>스토어 바로가기</span>
                  </a>
                  <Button variant="ghost" icon={<Wallet size={16} aria-hidden="true" />} onClick={() => openPay(store)}>
                    캐시백으로 결제하기(체험)
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <div className="spacer" />
      <p className="sm">상품권 대신 캐시로 돌려드립니다. 화천 농가의 온라인 판로가 함께 열립니다.</p>

      <BottomSheet open={selected !== null} modal label="주문 확인" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="sheet__body">
            <strong className="sheet__title">{selected.name}</strong>
            <div className="sheet__rows">
              <div className="row">
                <span className="sm">결제 금액</span>
                <strong>{formatWon(selected.price)}</strong>
              </div>
              <div className="row">
                <span className="sm">내 캐시</span>
                <strong>{formatWon(currentCashback)}</strong>
              </div>
            </div>
            {shortage > 0 ? <p className="sheet__warn">캐시가 {formatWon(shortage)} 부족해요. 영수증을 더 인증해 보세요.</p> : null}
            <div className="btn-pair">
              <Button variant="line" onClick={() => setSelected(null)}>
                취소
              </Button>
              <Button onClick={() => void handleOrder()} disabled={shortage > 0}>
                주문하기
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet open={payingStore !== null} modal label="캐시백 결제(체험)" onClose={closePay}>
        {payingStore ? (
          <div className="sheet__body">
            <strong className="sheet__title">{payingStore.name} · 캐시백 결제</strong>
            <p className="sm">체험용 화면이에요. 실제로 결제되지 않고, 캐시백만 사용 처리돼요.</p>
            <Field
              label="결제 금액 (원)"
              value={payAmountText}
              onChange={(event) => setPayAmountText(event.target.value)}
              error={payAmountError}
              inputMode="numeric"
              placeholder="결제 금액"
              disabled={paying}
            />
            <div className="row">
              <span className="sm">내 캐시백</span>
              <strong>{formatWon(currentCashback)}</strong>
            </div>
            <div className="btn-pair">
              <Button variant="line" onClick={closePay} disabled={paying}>
                취소
              </Button>
              <Button onClick={() => void handlePay()} disabled={paying}>
                {paying ? '처리하는 중…' : '캐시백으로 결제(체험)'}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
