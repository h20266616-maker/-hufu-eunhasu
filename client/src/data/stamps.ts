import type { StampReward, StampSpot } from '../types';

export const STAMP_SPOTS: readonly StampSpot[] = [
  { id: 'bungeoseom', name: '붕어섬', icon: 'island', hint: '체크인 미션 장소' },
  { id: 'sancheoneo-festival', name: '산천어 축제장', icon: 'fish', hint: '화천천 겨울 축제' },
  { id: 'paroho', name: '파로호', icon: 'lake', hint: '호수 전망 명소' },
  { id: 'peace-dam', name: '평화의 댐', icon: 'dam', hint: '안보 관광 코스' },
  { id: 'ttansan', name: '딴산 유원지', icon: 'valley', hint: '계곡과 캠핑' },
  { id: 'kkeomeok-bridge', name: '꺼먹다리', icon: 'bridge', hint: '한국전쟁 시기의 다리' },
  { id: 'joongang-market', name: '화천중앙시장', icon: 'market', hint: '현금 가게 QR 인증' },
  { id: 'jokbae', name: '쪽배 선착장', icon: 'boat', hint: '쪽배 체험' },
  { id: 'makguksu', name: '산천어막국수', icon: 'restaurant', hint: '제휴 식당' },
];

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
    id: 'badge',
    kind: 'badge',
    threshold: STAMP_SPOTS.length,
    title: '화천 완주 배지',
    description: '모든 스탬프를 모은 여행자에게 드리는 배지예요',
    cash: 0,
  },
];
