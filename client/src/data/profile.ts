import type { NotificationKey, NotificationSetting, Profile } from '../types';

/** 실제 개인정보가 아닌 명백한 더미 값. 로그인 직후 users/{uid} 문서를 만들 때 기본값으로 써요 */
export const DEFAULT_PROFILE: Profile = {
  nickname: '화천여행자',
  name: '김화천',
  phone: '010-0000-0000',
  email: 'demo@example.com',
  bankName: '더미은행',
  account: '000-0000-000000',
  role: 'traveler',
  consent: true,
  soldierVerified: false,
  soldierUnit: '',
  soldierDischargeDate: '',
};

/** 로그아웃 상태에서 화면을 둘러볼 때만 쓰는 값. 저장되지 않아요 */
export const GUEST_PROFILE: Profile = {
  ...DEFAULT_PROFILE,
  nickname: '게스트',
  name: '',
  phone: '',
  email: '',
  bankName: '',
  account: '',
};

export const NOTIFICATION_SETTINGS: readonly NotificationSetting[] = [
  { id: 'cashback', label: '캐시백 적립 알림', description: '영수증 인증 후 적립 결과를 알려드려요' },
  { id: 'stamp', label: '스탬프 알림', description: '새 스탬프와 보상 달성을 알려드려요' },
  { id: 'community', label: '커뮤니티 알림', description: '내 글의 댓글과 좋아요를 알려드려요' },
  { id: 'marketing', label: '이벤트·혜택 알림', description: '화천 지역 이벤트와 할인 소식을 보내드려요' },
];

export const DEFAULT_NOTIFICATION_PREFS: Record<NotificationKey, boolean> = {
  cashback: true,
  stamp: true,
  community: true,
  marketing: false,
};

export const CONSENT_NOTICE = [
  '수집 항목: 닉네임, 이름, 연락처, 이메일, 환급 계좌',
  '이용 목적: 캐시백 환급, 서비스 안내, 부정 인증 방지',
  '보유 기간: 서비스 탈퇴 시까지 (시연용 안내 문구)',
];
