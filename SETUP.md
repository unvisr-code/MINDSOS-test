# 🚀 MindSOS 설치 및 시연 가이드

클라이언트 시연을 위한 상세 설정 가이드입니다.

## ⚡ 빠른 시작 (5분 설정)

### 1단계: Firebase 프로젝트 생성 (2분)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `mindsos-demo` 입력
4. Google Analytics 비활성화 (데모용)
5. 프로젝트 생성 완료

### 2단계: Firebase 설정 (2분)

#### Authentication 활성화
1. 좌측 메뉴 > **Build > Authentication** 클릭
2. "시작하기" 클릭
3. **이메일/비밀번호** 방식 활성화
4. 저장

#### Firestore Database 생성
1. 좌측 메뉴 > **Build > Firestore Database** 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드로 시작** 선택 (데모용)
4. 위치: `asia-northeast3 (서울)` 선택
5. 사용 설정

#### Web 앱 추가
1. 프로젝트 설정 (⚙️ 아이콘) > 프로젝트 설정
2. 스크롤 다운 > "내 앱" 섹션에서 **웹 앱 추가** (</> 아이콘)
3. 앱 닉네임: `MindSOS Web` 입력
4. Firebase Hosting 체크 해제
5. "앱 등록" 클릭
6. **firebaseConfig 객체 복사** (다음 단계에서 사용)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAe1x03O-TaqjCU4DThL1VHx2TYsr4VFYA",
  authDomain: "mindsos-demo.firebaseapp.com",
  databaseURL: "https://mindsos-demo-default-rtdb.firebaseio.com",
  projectId: "mindsos-demo",
  storageBucket: "mindsos-demo.firebasestorage.app",
  messagingSenderId: "819122534051",
  appId: "1:819122534051:web:d1e2fddedd48714d50b116"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

### 3단계: OpenAI API 키 발급 (1분)

1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. "Create new secret key" 클릭
3. 이름: `mindsos-demo` 입력
4. **API 키 복사** (한 번만 표시됨)

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

### 4단계: 환경 변수 설정

프로젝트 폴더의 `.env.local` 파일을 열어 다음 내용으로 수정:

```env
# Firebase Configuration (Firebase 콘솔에서 복사한 값)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mindsos-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mindsos-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mindsos-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# OpenAI Configuration (OpenAI 플랫폼에서 복사한 값)
OPENAI_API_KEY=sk-proj-...
```

### 5단계: 프로젝트 실행

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📱 시연 시나리오

### 시나리오 1: 신규 사용자 온보딩

1. **회원가입**
   - 이메일: `demo@mindsos.com`
   - 비밀번호: `demo1234`
   - 닉네임: `체험사용자`

2. **홈 화면 둘러보기**
   - 출석 체크 확인
   - 오늘의 명언 공유 기능 시연
   - 기분 체크 선택
   - 미션 체크 기능 시연
   - 한 줄 일기 작성

### 시나리오 2: AI 코치 기능

1. **편지 작성**
   - 제목: `요즘 스트레스가 심해요`
   - 내용: `일과 학업을 병행하면서 너무 힘든데 어떻게 해야 할까요?`
   - 전송 후 AI 답변 확인

2. **편지 목록**
   - 전체 편지 / 내 편지 탭 전환
   - 비공개 설정 기능 확인

### 시나리오 3: 미션 관리

1. **미션 체크**
   - 미션 체크/해제 기능
   - 달성률 실시간 업데이트 확인

2. **시각화 확인**
   - 주간 달성률 그래프
   - 월간 캘린더
   - 연속 달성 트로피

### 시나리오 4: 커뮤니티

1. **게시글 작성**
   - 카테고리 선택: `챌린지 인증`
   - 제목/내용 작성
   - 익명 설정 옵션

2. **게시글 탐색**
   - 인기글/최신글 필터
   - 카테고리별 필터링
   - 좋아요/댓글 기능

### 시나리오 5: 마이페이지

1. **프로필 관리**
   - 닉네임, 이메일 확인
   - 활동 통계 (출석, 작성글, 트로피)

2. **활동 내역**
   - 작성한 글 목록
   - 저장한 글 목록
   - 트로피 모음

## 🎨 모바일 시연 팁

### Chrome DevTools 모바일 시뮬레이션

1. 개발자 도구 열기 (F12 또는 Cmd+Option+I)
2. Toggle Device Toolbar 클릭 (Cmd+Shift+M)
3. 디바이스: **iPhone 12 Pro** 선택
4. 가로/세로 모드 전환 가능

### 실제 모바일 기기에서 테스트

1. 개발 서버 실행 상태에서
2. 터미널에 표시된 네트워크 주소 확인 (예: `http://192.168.0.10:3000`)
3. 모바일 기기와 같은 WiFi 연결
4. 모바일 브라우저에서 해당 주소 접속

## 🐛 문제 해결

### Firebase 연결 오류

**증상**: "Firebase: Error (auth/invalid-api-key)"

**해결**:
1. `.env.local` 파일의 Firebase Config 값 재확인
2. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### OpenAI API 오류

**증상**: "AI 응답 생성 중 오류가 발생했습니다"

**해결**:
1. OpenAI API 키가 올바른지 확인
2. OpenAI 계정에 크레딧이 있는지 확인
3. API 키가 활성화되어 있는지 확인

### 포트 이미 사용 중

**증상**: "Port 3000 is already in use"

**해결**:
```bash
# 다른 포트로 실행
npm run dev -- -p 3001
```

## 📊 데모 데이터 준비

### Firebase Firestore에 샘플 데이터 추가

#### 1. 오늘의 명언 컬렉션

Firestore에서 `quotes` 컬렉션 생성 후 문서 추가:

```json
{
  "text": "마음이 평온할 때, 당신은 가장 강력한 당신이 됩니다.",
  "author": "익명",
  "date": "2024-01-15"
}
```

#### 2. 커뮤니티 게시글 샘플

`posts` 컬렉션 생성 후 문서 추가:

```json
{
  "category": "challenge",
  "title": "30일 명상 챌린지 완료!",
  "content": "드디어 30일을 채웠습니다. 처음엔 힘들었지만 이제는 하루의 필수가 되었어요.",
  "author": "익명",
  "isAnonymous": true,
  "likes": 42,
  "comments": 12,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## ✅ 시연 체크리스트

- [ ] Firebase 프로젝트 생성 완료
- [ ] Authentication 활성화
- [ ] Firestore Database 생성
- [ ] `.env.local` 파일 설정 완료
- [ ] OpenAI API 키 발급 및 설정
- [ ] 개발 서버 정상 실행
- [ ] 회원가입 테스트 성공
- [ ] AI 코치 답변 테스트 성공
- [ ] 모든 화면 정상 작동 확인

## 🎯 시연 시 강조 포인트

1. **빠른 개발 속도**: Next.js + Firebase로 7-8시간 만에 MVP 완성
2. **AI 통합**: OpenAI GPT-4 기반 실시간 AI 코칭
3. **반응형 디자인**: 모바일 최적화된 UI/UX
4. **확장 가능성**: Firebase 백엔드로 쉬운 스케일링
5. **데이터 분석 준비**: GA4, Clarity 통합 가능

## 📞 추가 지원

시연 중 문제가 발생하면 개발팀에 즉시 연락하세요.
