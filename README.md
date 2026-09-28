# 화천 지역상생 영수증

화천군에서 쓴 영수증을 인증하면 캐시백을 주고, 모은 캐시로 화천 특산물을 살 수 있는 지역상생 서비스입니다.
자전거 대여, 스탬프 투어, 여행자·사장님 커뮤니티까지 하나의 앱에서 제공합니다.

## 주요 기능

- **영수증 인증**: 카메라 촬영 또는 앨범 업로드로 영수증을 인증하고 캐시백 적립 (mock OCR)
- **스탬프 투어**: 화천 명소 9곳을 다니며 스탬프를 모으고 달성 보상 받기
- **지도·자전거**: OpenStreetMap 기반 지도에서 제휴 매장·자전거 대여소 확인 및 대여/반납
- **온라인 상점**: 적립한 캐시백으로 화천 특산물 주문 (자체 상품 + 외부 스마트스토어 캐시백 결제 체험)
- **커뮤니티**: 여행자·사장님 게시판 (글쓰기·댓글·좋아요)
- **군인 인증**: 인증 시 캐시백 1.5배 적용 및 전용 보상
- **체험(게스트) 계정**: "게스트로 둘러보기"는 Firebase 익명 로그인으로 실제 계정을 만들어서, 로그인 계정과 동일하게 전 기능을 제한 없이 씁니다. 새로고침·재접속해도 같은 세션이 유지되고, 로그아웃하면 다음엔 새 체험 계정으로 시작합니다. MY 화면의 "정식 회원가입하기"로 데이터 그대로 정식 계정 전환 가능

## mock 처리 중인 부분

이 프로토타입은 시연을 위해 아래 항목을 실제 연동 없이 mock으로 처리합니다. 실서비스 전환 시 참고하세요.

- **영수증 OCR**: 사진을 찍어도 실제로 글자를 읽지 않고, 미리 정해둔 예시 가맹점·금액을 순서대로 돌려씁니다 (카테고리만 사용자가 직접 선택). 실서비스에서는 OCR로 가맹점명·금액·영수증 번호를 추출해야 합니다.
- **영수증 중복 인증 방지**: `AppContext.tsx`의 `buildReceiptDedupeKey()`가 "가맹점명 + 금액 + 날짜(일 단위)" 조합만으로 중복을 판별합니다. 실서비스에서는 이 조합만으로 부족하고 다음이 추가로 필요합니다.
  - OCR로 읽은 영수증 고유번호 대조
  - 가맹점 사업자등록번호 DB와 대조해 실제 존재하는 가맹점인지 확인
  - 카드사·PG(결제대행사) 거래 데이터와 대사해 실제 결제 여부 확인
- **온라인 상점 캐시백 결제**: "캐시백으로 결제하기(체험)" 버튼은 실제 스마트스토어 결제와 연동되어 있지 않습니다. 캐시백 잔액만 차감하고 토스트로 완료를 알려주는 mock입니다. 실서비스에서는 스마트스토어 API 또는 자체 PG 연동이 필요합니다.
- **군인 인증**: 소속·전역예정일을 입력하면 바로 승인됩니다. 실서비스에서는 군인 신분증(또는 국방부 연동) 확인이 필요합니다.
- **커뮤니티 도배 방지**: 글쓰기를 1분에 3건으로 막는 쿨다운이 클라이언트(브라우저) 안에서만 동작합니다 (`useCommunity.ts`). API를 직접 호출하면 우회할 수 있어서, 실서비스에서는 Firestore 규칙이나 Cloud Functions로 서버 쪽에서도 막아야 합니다.

## 기술 스택

- [Vite](https://vitejs.dev) + React + TypeScript
- [Firebase](https://firebase.google.com) Authentication + Firestore
- [Leaflet](https://leafletjs.com) / OpenStreetMap (지도, API 키 불필요)
- [Capacitor](https://capacitorjs.com) (Android 앱 패키징)

## 프로젝트 구조

```
client/                 # 앱 소스 (Vite 프로젝트 루트)
  src/
  android/               # Capacitor Android 프로젝트
  scripts/seedCommunity.mjs  # 커뮤니티 시드 게시글 심기 (관리자용)
firebase.json            # Firestore 규칙·색인 배포 설정
firestore.rules
firestore.indexes.json
vercel.json               # Vercel 배포 설정
```

## 시작하기

```bash
cd client
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

### 환경 변수 (`client/.env.local`)

Firebase 콘솔 > 프로젝트 설정 > 일반 > "웹 앱 추가"에서 값을 확인할 수 있습니다.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

값이 없어도 앱은 실행되며, 로그인·저장 기능 대신 안내 문구가 표시됩니다.

### 익명 로그인(체험 계정) 켜기

"게스트로 둘러보기"가 Firebase 익명 로그인을 쓰기 때문에, 새 Firebase 프로젝트라면 콘솔에서 한 번 켜야 합니다.

1. [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트 선택 → **Authentication** → **Sign-in method** 탭
2. 제공업체 목록에서 **익명(Anonymous)** 선택 → **사용 설정(Enable)** 켜고 저장

켜지 않은 상태에서 "게스트로 둘러보기"를 누르면 "Firebase 콘솔에서 익명 로그인을 켜야 체험 계정을 쓸 수 있어요" 안내가 뜹니다.

### 체험 계정 → 정식 계정 전환

MY 화면의 "정식 회원가입하기"는 `linkWithCredential`(이메일) / `linkWithPopup`(Google)로 지금 쓰던 익명 계정에 로그인 수단을 "연결"합니다. uid가 그대로 이어지기 때문에 캐시백·스탬프·영수증·글 모두 그대로 남습니다. (`AuthContext.tsx`의 `upgradeWithEmail`/`upgradeWithGoogle`)

### Firestore 보안 규칙 적용

이 저장소의 `firestore.rules`를 실제 프로젝트에 적용하는 방법 두 가지입니다. 하나만 하면 됩니다.

**방법 A — Firebase 콘솔에 붙여넣기 (설치 없이 가능)**
1. [Firebase 콘솔](https://console.firebase.google.com) 접속 → 해당 프로젝트 선택
2. 왼쪽 메뉴 **Firestore Database** → 상단 **규칙(Rules)** 탭
3. 저장소의 `firestore.rules` 파일 내용을 전체 복사해서 콘솔 편집창에 붙여넣기 (기존 내용 전체 교체)
4. **게시(Publish)** 버튼 클릭 — 반영까지 1분 이내

**방법 B — Firebase CLI로 배포**
```bash
npm install -g firebase-tools   # 처음 한 번만
firebase login                  # 처음 한 번만
firebase deploy --only firestore:rules,firestore:indexes
```
`.firebaserc`에 프로젝트가 이미 연결돼 있어서 별도 프로젝트 선택 없이 바로 배포됩니다.

**주의**: 규칙을 바꾸면 즉시 운영 중인 데이터베이스에 적용됩니다. 배포 전에 `firestore.rules` 내용을 한 번 훑어보고, 특히 아래 두 가지가 의도한 대로인지 확인하세요.
- `posts`/`comments` 읽기 권한이 열려 있는지 (게스트도 로그인 전에 커뮤니티 목록을 볼 수 있게 하려는 의도적인 선택)
- `receipts` 삭제는 **익명(체험) 계정이 본인 것만** 가능하도록 예외를 둔 것 (MY의 "내 데이터 초기화" 기능용). 실제 회원 계정의 영수증은 여전히 삭제가 막혀 있어야 위변조 방지가 유지됩니다.

### 커뮤니티 시드 게시글 (선택)

```bash
cd client
node scripts/seedCommunity.mjs ./serviceAccountKey.json
```

## 주요 스크립트 (`client/` 안에서 실행)

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 검사 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run typecheck` | 타입 검사만 실행 |
| `npm run sync` | 빌드 후 Android 프로젝트에 반영 |
| `npm run open` | Android Studio로 열기 |

## 배포

[Vercel](https://vercel.com)에 배포되어 있으며, 이 저장소의 `main` 브랜치에 push하면 자동 배포됩니다.
