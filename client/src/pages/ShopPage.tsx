import { ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { AppIcon } from '../components/AppIcon';
import { BottomSheet } from '../components/BottomSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card, CardButton } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { EXTERNAL_STORES, PRODUCTS } from '../data';
import type { Product } from '../types';
import { formatWon } from '../utils/format';

export function ShopPage() {
  const { currentCashback, spendCash } = useApp();
  const showToast = useToast();
  const [selected, setSelected] = useState<Product | null>(null);

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

  return (
    <div className="page">
      <ScreenHeader title="특산물 상점" showBack={false} />
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
    </div>
  );
}
