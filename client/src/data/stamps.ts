import type { StampReward, StampSpot } from '../types';

export const STAMP_SPOTS: readonly StampSpot[] = [
  { id: 'bungeoseom', name: '붕어섬', icon: 'island', hint: '체크인 미션 장소', lat: 38.1063, lng: 127.7104 },
  { id: 'sancheoneo-festival', name: '산천어 축제장', icon: 'fish', hint: '화천천 겨울 축제', lat: 38.1057, lng: 127.7086 },
  { id: 'paroho', name: '파로호', icon: 'lake', hint: '호수 전망 명소', lat: 38.0426, lng: 127.6839 },
  { id: 'peace-dam', name: '평화의 댐', icon: 'dam', hint: '안보 관광 코스', lat: 38.2764, lng: 127.8248 },
  { id: 'ttansan', name: '딴산 유원지', icon: 'valley', hint: '계곡과 캠핑', lat: 38.114, lng: 127.722 },
  { id: 'kkeomeok-bridge', name: '꺼먹다리', icon: 'bridge', hint: '한국전쟁 시기의 다리', lat: 38.1075, lng: 127.7095 },
  { id: 'joongang-market', name: '화천중앙시장', icon: 'market', hint: '현금 가게 QR 인증', lat: 38.1069, lng: 127.7078 },
  { id: 'jokbae', name: '쪽배 선착장', icon: 'boat', hint: '쪽배 체험', lat: 38.1058, lng: 127.711 },
  { id: 'makguksu', name: '산천어막국수', icon: 'restaurant', hint: '제휴 식당', lat: 38.1066, lng: 127.7082 },
];

/** 여행자 등급에 곱해서 군인 인증 회원의 캐시백을 계산한다. data/cashback.ts와 함께 조정해요 */
export const STAMP_REWARDS: readonly StampReward[] = [
  {
    id: 'coupon',
    kind: 'coupon',
    threshold: 5,
    title: '특산물 쿠폰',
    description: '특산물 상점에서 바로 쓰는 캐시 5,000원을 드려요',
    cash: 5000,
  },
  {
    id: 'soldier-bonus',
    kind: 'coupon',
    threshold: 5,
    title: '군인 특별 쿠폰',
    description: '군인 인증 회원에게 드리는 추가 캐시 3,000원이에요',
    cash: 3000,
    soldierOnly: true,
  },
  {
    id: 'badge',
    kind: 'badge',
    threshold: STAMP_SPOTS.length,
    title: '화천 완주 배지',
    description: '모든 스탬프를 모은 여행자에게 드리는 배지예요',
    cash: 0,
  },
];
