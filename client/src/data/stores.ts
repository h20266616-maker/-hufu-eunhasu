export interface ExternalStore {
  id: string;
  name: string;
  tagline: string;
  url: string;
}

/** 화천 농가·소상공인이 운영하는 실제 스마트스토어. 새 탭으로 바로 연결한다 */
export const EXTERNAL_STORES: readonly ExternalStore[] = [
  { id: 'neoraean', name: '너래안', tagline: '고소하게 짜낸 국산 들기름', url: 'https://smartstore.naver.com/neoraean' },
  { id: 'ohworld-fnb', name: '오월 에프앤비', tagline: '오월농원에서 만든 수제 잼', url: 'https://smartstore.naver.com/ohworld_fnb' },
  { id: 'ohmyplant', name: '식물의정석', tagline: '건강하게 기른 반려식물', url: 'https://smartstore.naver.com/ohmyplant' },
];
