import type { MockReceipt, SampleReceiptLine } from '../types';

/** 사진 인증 시 순서대로 돌아가며 사용하는 mock 인식 결과 (실제 OCR 없음) */
export const MOCK_RECEIPTS: readonly MockReceipt[] = [
  { shop: '화천산천어막국수', amount: 24000, category: '식비', stampId: 'makguksu' },
  { shop: '붕어섬 쪽배 체험', amount: 15000, category: '체험', stampId: 'jokbae' },
  { shop: '화천중앙시장 옛골식당', amount: 18000, category: '식비', stampId: 'joongang-market' },
  { shop: '파로호 호반 펜션', amount: 88000, category: '숙박', stampId: 'paroho' },
  { shop: '화천 농산물 직판장', amount: 32000, category: '특산물', stampId: 'kkeomeok-bridge' },
  { shop: '딴산 캠핑 체험장', amount: 26000, category: '체험', stampId: 'ttansan' },
];

/** 영수증 화면에 보여주는 예시 감열지 영수증 */
export const SAMPLE_RECEIPT = {
  shop: '화천산천어막국수',
  address: '강원 화천군 화천읍 (예시)',
  lines: [
    { name: '물막국수', qty: 2, price: 18000 },
    { name: '비빔막국수', qty: 1, price: 9000 },
    { name: '수육 (소)', qty: 1, price: 15000 },
    { name: '공기밥', qty: 2, price: 2000 },
  ] satisfies SampleReceiptLine[],
  cardNote: '카드 승인 · 시연용 예시',
};
