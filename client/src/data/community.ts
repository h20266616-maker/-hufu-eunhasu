import type { Board, SeedPost } from '../types';

export const BOARD_LABELS: Record<Board, string> = {
  traveler: '여행자 커뮤니티',
  owner: '사장님 커뮤니티',
};

export const BOARD_CATEGORIES: Record<Board, readonly string[]> = {
  traveler: ['자전거 코스 후기', '맛집·특산물 추천', '동행 구하기', '영수증 인증 팁'],
  owner: ['가게 소식', '이벤트·할인 공지', '캐시백 운영 팁', '지역 상생 제안'],
};

export const OWNER_READONLY_NOTICE = '사장님 인증 후 이용 가능해요';

export const SEED_POSTS: readonly SeedPost[] = [
  {
    board: 'traveler',
    category: '자전거 코스 후기',
    title: '붕어섬에서 파로호까지 자전거길 다녀왔어요',
    body:
      '터미널 대여소에서 자전거를 빌려서 붕어섬을 한 바퀴 돌고 북한강변 자전거길로 파로호 쪽까지 다녀왔어요.\n' +
      '오르막이 거의 없어서 초보자도 편하게 탈 수 있었어요. 다만 강바람이 꽤 세니까 얇은 겉옷은 챙기세요.\n' +
      '왕복 두 시간쯤 걸렸고, 돌아오는 길에 중앙시장 대여소에 반납하니 편했습니다.',
    author: '강변러너',
    minutesAgo: 35,
    likes: 24,
    comments: [
      { author: '뚜벅이여행', body: '저도 이번 주말에 가보려고요. 파로호 전망대까지 가셨나요?', minutesAgo: 20 },
      { author: '강변러너', body: '네, 전망대 앞에서 쉬었다 왔어요. 사진 찍기 정말 좋아요.', minutesAgo: 12 },
    ],
  },
  {
    board: 'traveler',
    category: '맛집·특산물 추천',
    title: '산천어막국수 먹고 토마토까지 사 왔어요',
    body:
      '물막국수가 시원하고 육수가 깔끔해서 여름에도 좋았어요. 식사 후 영수증 인증하니 캐시백이 바로 들어왔고요.\n' +
      '쌓인 캐시로 화천 토마토 5kg를 주문했는데 당도가 높아서 집에서도 화천 생각이 나네요.',
    author: '맛집탐험가',
    minutesAgo: 140,
    likes: 41,
    comments: [{ author: '토마토러버', body: '토마토 저도 시켜봐야겠어요. 크기는 어땠나요?', minutesAgo: 90 }],
  },
  {
    board: 'traveler',
    category: '동행 구하기',
    title: '이번 토요일 쪽배 타실 분 계신가요',
    body:
      '혼자 1박 2일로 오는데 쪽배 체험은 2인 이상일 때 캐시백 5%p가 더 붙는다고 해서요.\n' +
      '토요일 오전 10시쯤 붕어섬 쪽배 선착장에서 만나실 분 있으면 댓글 남겨주세요. 체험 끝나고 같이 점심 먹어도 좋아요.',
    author: '주말여행자',
    minutesAgo: 260,
    likes: 9,
    comments: [
      { author: '호수좋아', body: '저 참여하고 싶어요. 두 명 더 모이면 좋겠네요.', minutesAgo: 200 },
      { author: '주말여행자', body: '좋아요! 오픈채팅은 내일 정리해서 올릴게요.', minutesAgo: 150 },
    ],
  },
  {
    board: 'traveler',
    category: '영수증 인증 팁',
    title: '영수증이 잘 안 읽힐 때 이렇게 찍어보세요',
    body:
      '감열지 영수증은 구겨져 있으면 인식이 잘 안 돼요. 평평한 곳에 펴고 위에서 수직으로 찍으면 한 번에 통과했어요.\n' +
      '그림자가 지지 않게 창가 쪽에서 찍는 것도 도움이 됩니다. 현금 결제는 가게 QR을 먼저 찍고 금액을 입력하면 돼요.',
    author: '인증고수',
    minutesAgo: 620,
    likes: 57,
    comments: [{ author: '초보여행자', body: '현금 QR 방법이 궁금했는데 감사합니다.', minutesAgo: 480 }],
  },
  {
    board: 'traveler',
    category: '자전거 코스 후기',
    title: '꺼먹다리 코스는 해질 무렵이 제일 예뻐요',
    body:
      '오후 다섯 시쯤 출발해서 꺼먹다리를 지나 강변을 따라 달렸어요. 노을이 물에 비치는 풍경이 정말 좋았습니다.\n' +
      '어두워지기 전에 반납해야 해서 여유 있게 출발하시길 추천해요.',
    author: '노을사냥꾼',
    minutesAgo: 1500,
    likes: 33,
    comments: [],
  },
  {
    board: 'traveler',
    category: '맛집·특산물 추천',
    title: '산천어 훈제 세트 선물용으로 괜찮아요',
    body:
      '부모님 선물로 훈제 세트를 주문했는데 포장이 깔끔하고 냄새도 심하지 않았어요.\n' +
      '캐시로 결제하니 부담이 적어서 다음에는 사과즙도 같이 사려고요.',
    author: '효도여행',
    minutesAgo: 2900,
    likes: 18,
    comments: [{ author: '맛집탐험가', body: '저도 훈제 세트 궁금했는데 후기 감사해요.', minutesAgo: 2700 }],
  },
  {
    board: 'owner',
    category: '가게 소식',
    title: '이번 주부터 물막국수에 산천어 고명을 올립니다',
    body:
      '올여름 신메뉴로 산천어 살을 얇게 저며 올린 물막국수를 시작했습니다. 가격은 그대로예요.\n' +
      '여행 오시는 분들이 지역 재료를 더 느끼실 수 있도록 준비했으니 많이 찾아주세요.',
    author: '산천어막국수 사장',
    minutesAgo: 55,
    likes: 15,
    comments: [{ author: '중앙시장 옛골식당', body: '메뉴 소식 좋네요. 저희도 지역 식재료를 더 써볼까 합니다.', minutesAgo: 30 }],
  },
  {
    board: 'owner',
    category: '이벤트·할인 공지',
    title: '쪽배 체험 2인 이상 방문 시 음료 서비스',
    body:
      '주말 동안 쪽배 체험을 예약하신 2인 이상 팀에게 따뜻한 차를 드립니다. 영수증 인증 화면만 보여주시면 돼요.\n' +
      '캐시백 5%p 미션과 겹쳐서 손님들 반응이 좋습니다.',
    author: '쪽배지기',
    minutesAgo: 180,
    likes: 22,
    comments: [
      { author: '호반펜션', body: '숙박 손님께도 쿠폰 형태로 안내해도 될까요?', minutesAgo: 120 },
      { author: '쪽배지기', body: '네, 좋은 방법이에요. 문구는 저희 것 참고하셔도 됩니다.', minutesAgo: 100 },
    ],
  },
  {
    board: 'owner',
    category: '캐시백 운영 팁',
    title: '현금 손님 QR 인증, 이렇게 안내하니 편했어요',
    body:
      '계산대 옆에 QR을 세워두고 "현금이면 QR 찍고 금액 입력, 저는 확인만 누릅니다"라고 적어뒀어요.\n' +
      '손님이 알아서 진행하시니 제가 따로 설명할 일이 줄었습니다. 확인 버튼은 앱 알림으로 바로 뜹니다.',
    author: '옛골식당 사장',
    minutesAgo: 420,
    likes: 31,
    comments: [{ author: '농산물직판장', body: '안내문 사진 공유해 주실 수 있나요?', minutesAgo: 300 }],
  },
  {
    board: 'owner',
    category: '지역 상생 제안',
    title: '자전거 대여소마다 지역 가게 쿠폰 배포는 어떨까요',
    body:
      '대여소에서 자전거를 빌리는 분들께 인근 가게 쿠폰을 함께 보여주면 자연스럽게 방문이 이어질 것 같아요.\n' +
      '참여하실 사장님이 있으면 의견 남겨주세요. 붕어섬 입구부터 시범으로 해보면 좋겠습니다.',
    author: '호반펜션',
    minutesAgo: 880,
    likes: 27,
    comments: [{ author: '산천어막국수 사장', body: '찬성입니다. 저희는 터미널 쪽 쿠폰 참여할게요.', minutesAgo: 700 }],
  },
  {
    board: 'owner',
    category: '가게 소식',
    title: '비 오는 날 농산물 직판장 운영 시간 안내',
    body:
      '장마철에는 오전 9시부터 오후 5시까지만 운영합니다. 택배 발송은 평소와 동일하게 진행돼요.\n' +
      '특산물 상점에서 주문하신 분들도 배송 일정은 변동 없으니 걱정하지 않으셔도 됩니다.',
    author: '농산물직판장',
    minutesAgo: 1900,
    likes: 8,
    comments: [],
  },
];
