import type { BikeStation, MapPlace } from '../types';

export const MAP_PLACES: readonly MapPlace[] = [
  {
    id: 'place-makguksu',
    kind: 'eat',
    name: '화천산천어막국수',
    description: '식비 영수증 인증 시 캐시백이 적용돼요',
    icon: 'restaurant',
    x: 30,
    y: 35,
    stampId: 'makguksu',
  },
  {
    id: 'place-yetgol',
    kind: 'eat',
    name: '중앙시장 옛골식당',
    description: '현금 가게 · QR 인증 가능',
    icon: 'market',
    x: 63,
    y: 28,
    stampId: 'joongang-market',
  },
  {
    id: 'place-bungeoseom',
    kind: 'see',
    name: '붕어섬',
    description: '체크인 미션 +3,000원',
    icon: 'island',
    x: 58,
    y: 62,
    stampId: 'bungeoseom',
  },
  {
    id: 'place-peace-dam',
    kind: 'see',
    name: '화천 평화의 댐',
    description: '입장권은 쿠폰으로 지급',
    icon: 'dam',
    x: 80,
    y: 72,
    stampId: 'peace-dam',
  },
];

export const BIKE_STATIONS: readonly BikeStation[] = [
  { id: 'station-terminal', name: '화천버스터미널', x: 18, y: 74, bikes: 6, distance: '도보 1분' },
  { id: 'station-market', name: '화천중앙시장', x: 70, y: 46, bikes: 4, distance: '1.2km' },
  { id: 'station-bungeoseom', name: '붕어섬 입구', x: 36, y: 54, bikes: 9, distance: '2.4km' },
];
