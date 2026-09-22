import type { Board, SeedPost } from '../types';
import seedPostsData from './seed-posts.json';

export const BOARD_LABELS: Record<Board, string> = {
  traveler: '여행자 커뮤니티',
  owner: '사장님 커뮤니티',
};

export const BOARD_CATEGORIES: Record<Board, readonly string[]> = {
  traveler: ['자전거 코스 후기', '맛집·특산물 추천', '동행 구하기', '영수증 인증 팁'],
  owner: ['가게 소식', '이벤트·할인 공지', '캐시백 운영 팁', '지역 상생 제안'],
};

export const OWNER_READONLY_NOTICE = '사장님 인증 후 이용 가능해요';

/** scripts/seedCommunity.mjs가 Firestore에 심을 때도 이 파일을 그대로 읽는다 */
export const SEED_POSTS: readonly SeedPost[] = seedPostsData as readonly SeedPost[];
