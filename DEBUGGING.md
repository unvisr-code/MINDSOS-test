# MindSOS 디버깅 가이드

## 발견된 문제 및 해결 방법

### 1. 무한 로딩 문제 ✅ 해결됨

#### 문제 증상
- 페이지 접속 시 계속 로딩 스피너만 표시됨
- 페이지가 로드되지 않음

#### 원인
1. **의존성 배열의 `router` 객체**
   - `useEffect`의 의존성 배열에 `router` 객체가 포함되어 있음
   - `router` 객체가 매 렌더링마다 새로 생성되어 무한 루프 발생

2. **중복 인증 체크**
   - `(main)/layout.tsx`와 각 페이지에서 모두 인증 체크를 수행
   - 중복된 로딩 상태 관리

#### 해결 방법

**파일: `app/page.tsx`**
```typescript
// ❌ 이전 (문제 있음)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    // ...
  });
  return () => unsubscribe();
}, [router]); // router가 의존성 배열에 있음

// ✅ 수정 후 (해결됨)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    // ...
  });
  return () => unsubscribe();
}, []); // 빈 배열 - 컴포넌트 마운트 시에만 실행
```

**파일: `app/(main)/layout.tsx`**
```typescript
// ❌ 이전 (문제 있음)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push('/login');
    }
    setLoading(false); // 조건 없이 항상 실행
  });
  return () => unsubscribe();
}, [router]);

// ✅ 수정 후 (해결됨)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);

    if (!firebaseUser) {
      router.push('/login');
    } else {
      setLoading(false); // 사용자가 있을 때만 로딩 완료
    }
  });
  return () => unsubscribe();
}, []); // 빈 배열
```

### 2. Firebase 연결 오류 처리 ✅ 개선됨

#### 추가된 기능

**파일: `lib/firebase.ts`**
- 환경 변수 검증 로직 추가
- 누락된 설정 항목 자동 감지
- 초기화 로그 추가

```typescript
// Validate Firebase config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration:', missingKeys);
  throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
}
```

**파일: `lib/hooks.ts`**
- useAuth 훅에 에러 핸들링 추가
- try-catch-finally 블록으로 안전성 강화

```typescript
try {
  setUser(firebaseUser);
  if (firebaseUser) {
    // 프로필 로드 로직
  }
} catch (error) {
  console.error('Error in auth state change:', error);
  setUserProfile(null);
} finally {
  setLoading(false);
}
```

## 일반적인 문제 해결

### 로딩이 계속될 때

1. **브라우저 콘솔 확인**
   ```bash
   F12 → Console 탭
   ```
   - Firebase 초기화 로그 확인
   - 에러 메시지 확인

2. **환경 변수 확인**
   ```bash
   # .env.local 파일이 존재하는지 확인
   ls -la .env.local

   # 환경 변수 값이 설정되어 있는지 확인
   cat .env.local
   ```

3. **개발 서버 재시작**
   ```bash
   # 기존 서버 종료 (Ctrl+C)
   # 재시작
   npm run dev
   ```

4. **캐시 삭제**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Firebase 인증 오류

1. **Firebase Console 확인**
   - Authentication이 활성화되어 있는지 확인
   - Email/Password 로그인 방법이 활성화되어 있는지 확인

2. **API 키 검증**
   ```javascript
   // 브라우저 콘솔에서 실행
   console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
   ```
   - `undefined`가 나오면 환경 변수가 설정되지 않은 것

3. **도메인 인증**
   - Firebase Console → Authentication → Settings → Authorized domains
   - `localhost` 추가 확인

### Firestore 연결 오류

1. **Firestore 활성화 확인**
   - Firebase Console → Firestore Database
   - 데이터베이스가 생성되어 있는지 확인

2. **보안 규칙 확인**
   - `FIRESTORE_RULES.md` 파일의 규칙이 적용되어 있는지 확인
   - 테스트 모드로 시작했다면 규칙이 만료되었을 수 있음

3. **네트워크 오류**
   ```javascript
   // 브라우저 콘솔에서 Firestore 연결 테스트
   import { db } from '@/lib/firebase';
   import { collection, getDocs } from 'firebase/firestore';

   const testConnection = async () => {
     try {
       const snapshot = await getDocs(collection(db, 'users'));
       console.log('Firestore connected:', snapshot.size, 'documents');
     } catch (error) {
       console.error('Firestore connection error:', error);
     }
   };
   ```

## 개발 환경 체크리스트

### 시작 전 확인사항

- [ ] Node.js 18.x 이상 설치됨
- [ ] npm 패키지 설치 완료 (`npm install`)
- [ ] `.env.local` 파일 존재 및 설정 완료
- [ ] Firebase 프로젝트 생성됨
- [ ] Firebase Authentication 활성화됨
- [ ] Firestore Database 생성됨
- [ ] OpenAI API 키 발급됨

### 실행 시 확인사항

- [ ] 개발 서버가 정상적으로 시작됨 (`npm run dev`)
- [ ] 브라우저 콘솔에 에러 없음
- [ ] Firebase 초기화 로그 확인됨
- [ ] 로그인 페이지가 정상적으로 표시됨
- [ ] 회원가입/로그인 작동 확인

### 배포 전 확인사항

- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 환경 변수가 배포 플랫폼에 설정됨
- [ ] Firestore 보안 규칙이 적용됨
- [ ] OpenAI API 키가 유효함
- [ ] 모든 페이지 접근 테스트 완료

## 유용한 디버깅 명령어

### 로그 확인
```bash
# Next.js 개발 서버 로그
npm run dev

# Next.js 빌드 로그
npm run build

# 환경 변수 확인 (macOS/Linux)
printenv | grep NEXT_PUBLIC

# 환경 변수 확인 (Windows)
set | findstr NEXT_PUBLIC
```

### Firebase 디버깅
```javascript
// 브라우저 콘솔에서 실행

// 1. 현재 인증 상태 확인
import { auth } from '@/lib/firebase';
console.log('Current user:', auth.currentUser);

// 2. Firestore 연결 테스트
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'users'));
console.log('Users count:', snapshot.size);

// 3. Firebase 설정 확인
console.log('Firebase config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + '...',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
});
```

### 네트워크 디버깅
```bash
# Firebase 엔드포인트 연결 테스트
curl -I https://firebaseapp.com

# OpenAI API 연결 테스트
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 알려진 제한사항

### 1. 개발 환경
- Hot Module Replacement 사용 시 Firebase 인증 상태가 초기화될 수 있음
- 해결: 페이지 새로고침 (F5)

### 2. Firebase
- 무료 플랜 제한:
  - Firestore: 50K reads/day, 20K writes/day
  - Authentication: 무제한
  - Storage: 5GB

### 3. OpenAI API
- 요금제에 따른 사용량 제한
- 응답 시간: 평균 2-5초
- Rate limiting 적용 가능

## 추가 리소스

### 공식 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### 커뮤니티
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js+firebase)

## 버전 정보

- Next.js: 15.5.4
- React: 19.x
- Firebase: 12.x
- TypeScript: 5.x
- Tailwind CSS: 4.x

---

**마지막 업데이트**: 2025-10-02
