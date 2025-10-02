# MindSOS Deployment Guide

## 프로젝트 개요

MindSOS는 Next.js 15, Firebase, OpenAI API를 사용한 멘탈 케어 코칭 앱입니다.

## 빌드 성공 ✅

프로젝트가 성공적으로 빌드되었습니다:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      864 B         220 kB
├ ○ /_not-found                            996 B         103 kB
├ ƒ /api/coach                             119 B         102 kB
├ ○ /coach                               4.93 kB         224 kB
├ ○ /community                           5.73 kB         225 kB
├ ○ /home                                4.72 kB         232 kB
├ ○ /login                               2.47 kB         222 kB
├ ○ /mission                             94.3 kB         321 kB
└ ○ /mypage                              5.31 kB         224 kB
```

## 완성된 기능

### 1. 홈 화면 (`/home`)
- ✅ Firebase 출석 체크 및 연속 출석일 추적
- ✅ 오늘의 감정 선택 및 저장
- ✅ 한 줄 일기 작성 및 저장
- ✅ 오늘의 미션 표시 및 완료 체크
- ✅ 오늘의 명언 표시 및 공유 기능

### 2. AI 코치 (`/coach`)
- ✅ OpenAI GPT-4 기반 AI 코치 응답
- ✅ 편지 작성 및 저장
- ✅ 공개/비공개 설정
- ✅ 전체 편지 및 내 편지 탭
- ✅ AI 응답 실시간 생성 및 저장

### 3. 미션 & 리포트 (`/mission`)
- ✅ 미션 추가/삭제/완료 체크
- ✅ 오늘의 달성률 계산
- ✅ 연속 달성일 추적
- ✅ 주간 달성률 그래프 (Recharts)
- ✅ 달성 캘린더 표시

### 4. 커뮤니티 (`/community`)
- ✅ 게시글 작성 (카테고리별)
- ✅ 좋아요 기능
- ✅ 댓글 작성 및 표시
- ✅ 인기글/최신글 탭
- ✅ 익명 작성 옵션
- ✅ 게시글 상세 보기

### 5. 마이페이지 (`/mypage`)
- ✅ 프로필 정보 표시
- ✅ 닉네임 수정
- ✅ 활동 통계 (출석일수, 작성글, 트로피)
- ✅ 설정 메뉴
- ✅ 로그아웃 기능

## 배포 방법

### 1. Vercel 배포 (권장)

#### 사전 준비
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub에 프로젝트 푸시

#### 배포 단계
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

#### 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 추가하세요:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_api_key
```

### 2. Firebase Hosting 배포

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

### 3. 기타 플랫폼

#### Netlify
```bash
# netlify.toml 생성
[build]
  command = "npm run build"
  publish = ".next"

# Netlify CLI 사용
netlify deploy --prod
```

#### AWS Amplify
1. AWS Amplify Console 접속
2. GitHub 저장소 연결
3. 빌드 설정: `npm run build`
4. 환경 변수 추가
5. 배포

## Firebase 설정

### 1. Firestore 보안 규칙 적용

`FIRESTORE_RULES.md` 파일의 규칙을 Firebase Console에 적용하세요:

1. [Firebase Console](https://console.firebase.google.com) 접속
2. Firestore Database → Rules 탭
3. 규칙 복사 및 붙여넣기
4. "게시" 버튼 클릭

### 2. Authentication 설정

1. Firebase Console → Authentication
2. 로그인 방법 → 이메일/비밀번호 활성화
3. (선택) Google 로그인 등 추가 로그인 방법 활성화

### 3. Firestore 인덱스 생성

다음 쿼리를 위한 복합 인덱스가 필요합니다:

```
Collection: posts
Fields:
  - likes (Descending)
  - createdAt (Descending)
```

Firebase Console에서 자동으로 인덱스 생성 제안이 나타날 것입니다.

## 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 접속
# http://localhost:3000
```

## 환경 변수 설정 (.env.local)

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key
```

## 프로젝트 구조

```
MINDSOS/
├── app/
│   ├── (main)/           # 인증 필요한 메인 페이지들
│   │   ├── home/         # 홈 화면
│   │   ├── coach/        # AI 코치
│   │   ├── mission/      # 미션 & 리포트
│   │   ├── community/    # 커뮤니티
│   │   └── mypage/       # 마이페이지
│   ├── api/
│   │   └── coach/        # OpenAI API 라우트
│   ├── login/            # 로그인 페이지
│   └── layout.tsx        # 루트 레이아웃
├── components/
│   └── BottomNav.tsx     # 하단 네비게이션
├── lib/
│   ├── firebase.ts       # Firebase 설정
│   ├── firestore.ts      # Firestore CRUD 함수
│   └── hooks.ts          # 커스텀 훅 (useAuth)
└── types/
    └── index.ts          # TypeScript 타입 정의
```

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore)
- **AI**: OpenAI GPT-4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date**: date-fns

## 성능 최적화

- ✅ 정적 페이지 생성 (Static Generation)
- ✅ 이미지 최적화 (Next.js Image)
- ✅ 코드 스플리팅 자동 적용
- ✅ 번들 크기 최적화

## 보안 고려사항

- ✅ Firestore 보안 규칙 적용
- ✅ API 키 환경 변수 관리
- ✅ 서버 사이드 OpenAI API 호출
- ✅ 사용자 인증 검증

## 모니터링 및 유지보수

### Firebase Console에서 확인할 사항
1. **Authentication**: 사용자 가입 및 로그인 추적
2. **Firestore**: 데이터베이스 사용량 및 읽기/쓰기 횟수
3. **Functions**: (향후) Cloud Functions 사용 시 모니터링
4. **Analytics**: 사용자 행동 분석

### Vercel Dashboard에서 확인할 사항
1. **Deployments**: 배포 상태 및 로그
2. **Analytics**: 페이지 뷰 및 성능
3. **Logs**: 서버 사이드 에러 로그
4. **Usage**: API 요청 및 대역폭

## 문제 해결

### 빌드 실패 시
```bash
# 캐시 삭제
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Firebase 연결 실패 시
1. `.env.local` 파일의 환경 변수 확인
2. Firebase Console에서 프로젝트 설정 재확인
3. Firebase SDK 버전 확인

### OpenAI API 오류 시
1. API 키 유효성 확인
2. API 사용량 및 요금 확인
3. 네트워크 연결 상태 확인

## 다음 단계 (선택사항)

1. **PWA 지원**:
   - `next-pwa` 설치 및 설정
   - 오프라인 모드 지원

2. **푸시 알림**:
   - Firebase Cloud Messaging 설정
   - 알림 기능 구현

3. **이미지 업로드**:
   - Firebase Storage 연동
   - 프로필 사진 및 게시글 이미지 업로드

4. **다국어 지원**:
   - i18n 라이브러리 추가
   - 한국어/영어 지원

5. **관리자 페이지**:
   - 사용자 관리
   - 콘텐츠 관리
   - 통계 대시보드

## 문의

프로젝트 관련 문의사항이나 이슈가 있으시면 GitHub Issues를 이용해주세요.

---

**프로젝트 완료 ✅**

모든 핵심 기능이 구현되었으며, 프로덕션 배포가 가능한 상태입니다.
