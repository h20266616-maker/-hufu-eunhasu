import type { Mission, Product } from '../types';

export const PRODUCTS: readonly Product[] = [
  { id: 'tomato', name: '화천 토마토 5kg', description: '파로호 인근 농가 직송', price: 18000, icon: 'produce' },
  { id: 'smoked-trout', name: '산천어 훈제 세트', description: '축제 기간 인기 상품', price: 25000, icon: 'fish' },
  { id: 'apple-juice', name: '화천 사과즙 30포', description: '당도 선별 등급', price: 21000, icon: 'drink' },
];

export const MISSIONS: readonly Mission[] = [
  { id: 'mission-bungeoseom', title: '붕어섬 방문하기', description: '체크인하면 3,000원 즉시 지급', badge: '+3,000' },
  { id: 'mission-together', title: '2인 이상 함께 방문', description: '일행 인증 시 캐시백 5%p 추가', badge: '+5%p' },
  { id: 'mission-stay', title: '1박 더 머무르기', description: '숙박 영수증 2장부터 20% 적용', badge: '+10%p' },
];
