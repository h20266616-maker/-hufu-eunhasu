import type { BikeStation, MapPlace } from '../types';

export const MAP_PLACES: readonly MapPlace[] = [
  {
    id: 'place-makguksu',
    kind: 'eat',
    name: '화천산천어막국수',
    description: '식비 영수증 인증 시 캐시백이 적용돼요',
    icon: 'restaurant',
    lat: 38.1066,
    lng: 127.7082,
    stampId: 'makguksu',
  },
  {
    id: 'place-yetgol',
    kind: 'eat',
    name: '중앙시장 옛골식당',
    description: '현금 가게 · QR 인증 가능',
    icon: 'market',
    lat: 38.1069,
    lng: 127.7078,
    stampId: 'joongang-market',
  },
  {
    id: 'place-bungeoseom',
    kind: 'see',
    name: '붕어섬',
    description: '체크인 미션 +3,000원',
    icon: 'island',
    lat: 38.1063,
    lng: 127.7104,
    stampId: 'bungeoseom',
  },
  {
    id: 'place-peace-dam',
    kind: 'see',
    name: '화천 평화의 댐',
    description: '입장권은 쿠폰으로 지급',
    icon: 'dam',
    lat: 38.2764,
    lng: 127.8248,
    stampId: 'peace-dam',
  },
  {
    id: 'place-sikmul-jeongseok',
    kind: 'eat',
    name: '식물의정석',
    description: '건강하게 기른 반려식물 · 특산물 상점 입점',
    icon: 'produce',
    lat: 38.045355076987,
    lng: 127.78379335524608,
  },
  {
    id: 'place-neoraean',
    kind: 'eat',
    name: '농업회사법인 너래안',
    description: '고소하게 짜낸 국산 들기름 · 특산물 상점 입점',
    icon: 'produce',
    lat: 38.0515866055743,
    lng: 127.816614758333,
  },
  {
    id: 'place-muraei',
    kind: 'cafe',
    name: '무래이',
    description: '간동면 카페',
    icon: 'drink',
    lat: 38.0545312757994,
    lng: 127.817186388405,
  },
  {
    id: 'place-supe',
    kind: 'cafe',
    name: '수페',
    description: '간동면 오음리',
    icon: 'drink',
    lat: 38.0483113763327,
    lng: 127.832388775293,
  },
];

export const BIKE_STATIONS: readonly BikeStation[] = [
  { id: 'station-terminal', name: '화천버스터미널', lat: 38.1042, lng: 127.707, bikes: 6, distance: '도보 1분' },
  { id: 'station-market', name: '화천중앙시장', lat: 38.1069, lng: 127.7078, bikes: 4, distance: '1.2km' },
  { id: 'station-bungeoseom', name: '붕어섬 입구', lat: 38.105, lng: 127.7098, bikes: 9, distance: '2.4km' },
];

/** 지도 중심 (화천읍) */
export const MAP_CENTER = { lat: 38.1064, lng: 127.7089 };
