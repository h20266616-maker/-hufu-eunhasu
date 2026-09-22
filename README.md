# 화천 지역상생 영수증

화천군에서 쓴 영수증을 인증하면 캐시백을 주고, 모은 캐시로 화천 특산물을 살 수 있는 지역상생 서비스입니다.
자전거 대여, 스탬프 투어, 여행자·사장님 커뮤니티까지 하나의 앱에서 제공합니다.

## 주요 기능

- **영수증 인증**: 카메라 촬영 또는 앨범 업로드로 영수증을 인증하고 캐시백 적립 (mock OCR)
- **스탬프 투어**: 화천 명소 9곳을 다니며 스탬프를 모으고 달성 보상 받기
- **지도·자전거**: OpenStreetMap 기반 지도에서 제휴 매장·자전거 대여소 확인 및 대여/반납
- **특산물 상점**: 적립한 캐시로 화천 특산물 주문
- **커뮤니티**: 여행자·사장님 게시판 (글쓰기·댓글·좋아요)
- **군인 인증**: 인증 시 캐시백 1.5배 적용 및 전용 보상
- **게스트 모드**: 로그인 없이 로컬 상태로 앱 전체를 체험 가능 (새로고침 시 초기화)

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

### Firestore 규칙·색인 배포

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

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
