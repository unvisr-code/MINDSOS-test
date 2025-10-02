# MindSOS - 멘탈케어 코칭 앱 MVP

AI 코치와 함께하는 마음 건강 관리 애플리케이션

## 🎯 프로젝트 개요

MindSOS는 사용자가 자신의 감정 상태를 기록하고, AI 코치와의 소통을 통해 심리적 안정과 성장을 도모할 수 있는 모바일 웹 애플리케이션입니다.

### 주요 기능

- **홈 화면**: 출석 체크, 오늘의 명언, 데일리 미션, 한 줄 일기
- **AI 코치**: 편지 형식의 고민 기록 및 AI 답변
- **미션 & 리포트**: 개인화 미션 관리, 달성률 시각화
- **커뮤니티**: 익명 기반 게시판, 챌린지 인증
- **마이페이지**: 프로필 관리, 활동 내역, 트로피

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI**: OpenAI GPT-4
- **UI 라이브러리**: Lucide React, Recharts, date-fns

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (Email/Password 방식)
3. Firestore Database 생성
4. 프로젝트 설정에서 Web 앱 추가 후 config 정보를 `.env.local`에 입력

### 4. OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. `.env.local`의 `OPENAI_API_KEY`에 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📱 주요 화면

### 로그인/회원가입
- Email/Password 기반 인증
- Firebase Authentication 사용

### 홈 화면
- 일일 출석 체크 및 연속 출석 트로피
- 오늘의 명언 (공유/저장 기능)
- 오늘의 기분 체크
- 데일리 미션 체크리스트
- 한 줄 일기 작성

### AI 코치
- 편지 형식의 고민 작성
- OpenAI GPT-4 기반 AI 답변
- 전체 편지/내 편지 목록
- 비공개 설정 기능

### 미션 & 리포트
- 개인화 미션 관리
- 주간 달성률 그래프
- 월간 달성 캘린더
- 성과 공유 기능

### 커뮤니티
- 카테고리별 게시판 (챌린지, 고민, 정보, 후기)
- 익명/실명 게시 선택
- 좋아요 및 댓글 기능
- 인기글/최신글 필터

### 마이페이지
- 프로필 관리
- 활동 내역 (작성글, 저장글, 트로피)
- 설정 및 공지사항

## 🗂 프로젝트 구조

```
mindsos/
├── app/
│   ├── (main)/          # 인증 필요 페이지
│   │   ├── home/
│   │   ├── coach/
│   │   ├── mission/
│   │   ├── community/
│   │   └── mypage/
│   ├── api/             # API Routes
│   │   └── coach/
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/          # 재사용 컴포넌트
│   └── BottomNav.tsx
├── lib/                 # 유틸리티 및 설정
│   └── firebase.ts
├── types/               # TypeScript 타입 정의
│   └── index.ts
└── public/              # 정적 파일
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
```

1. [Vercel](https://vercel.com/)에 프로젝트 연결
2. 환경 변수 설정 (`.env.local` 내용 복사)
3. 배포 완료

## ✅ 완성된 기능

### 핵심 기능 (완료)
- ✅ Firebase Firestore 데이터베이스 스키마 설계 및 구현
- ✅ AI 코치 답변 저장 및 불러오기 (OpenAI GPT-4)
- ✅ 실제 사용자 인증 플로우 완성 (Firebase Auth)
- ✅ 미션 데이터 저장 및 동기화
- ✅ 커뮤니티 게시글/댓글 시스템
- ✅ 프로필 관리 기능
- ✅ 일일 출석 체크 및 연속 기록
- ✅ 감정 기록 및 일기 작성

### 보안 및 배포
- ✅ Firestore Security Rules 문서화 (`FIRESTORE_RULES.md`)
- ✅ 프로덕션 빌드 검증 완료
- ✅ 환경 변수 관리 체계

## 🔒 보안 설정

Firestore 보안 규칙은 `FIRESTORE_RULES.md` 파일을 참조하여 Firebase Console에 적용하세요.

주요 보안 기능:
- 사용자 데이터 접근 제어
- 개인정보 보호 (일기, 미션)
- 공개/비공개 컨텐츠 분리
- 데이터 검증 및 무결성 보장

## 📊 향후 개선 사항

### 기능 확장
- [ ] 이미지 업로드 (Firebase Storage 연동)
- [ ] 푸시 알림 (FCM)
- [ ] 다크모드
- [ ] PWA 지원
- [ ] 소셜 로그인 (Google, Apple)

### 분석 및 최적화
- [ ] Google Analytics 4 연동
- [ ] 성능 모니터링
- [ ] SEO 최적화
- [ ] 접근성 개선 (WCAG 준수)

## 📄 라이선스

이 프로젝트는 데모/POC 목적으로 제작되었습니다.

## 👥 개발팀

LeanUp - Next.js 기반 풀스택 개발

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
