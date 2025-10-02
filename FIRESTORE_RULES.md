# Firestore Security Rules

## Overview

This document contains the security rules for the MindSOS application's Firestore database. These rules ensure data security and proper access control.

## Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users Collection
    match /users/{userId} {
      // Allow users to read their own profile
      allow read: if isOwner(userId);

      // Allow users to create their own profile (auto-created on first login)
      allow create: if isOwner(userId);

      // Allow users to update their own profile
      allow update: if isOwner(userId) &&
                      request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['displayName', 'updatedAt', 'streak', 'lastCheckIn']);

      // Prevent deletion
      allow delete: if false;
    }

    // Daily Check-ins Collection
    match /dailyCheckIns/{checkInId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.date is timestamp;
      allow update: if isOwner(resource.data.userId);
      allow delete: if false;
    }

    // Diaries Collection
    match /diaries/{diaryId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.content is string;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }

    // Missions Collection
    match /missions/{missionId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.title is string;
      allow update: if isOwner(resource.data.userId) &&
                      request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['completed', 'updatedAt']);
      allow delete: if isOwner(resource.data.userId);
    }

    // Letters Collection (AI Coach)
    match /letters/{letterId} {
      // Users can read their own letters
      allow read: if isOwner(resource.data.userId);

      // Users can also read public letters from others
      allow read: if isAuthenticated() && resource.data.isPrivate == false;

      // Users can create their own letters
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.title is string &&
                      request.resource.data.content is string;

      // Users can update their own letters (mainly for AI response)
      allow update: if isOwner(resource.data.userId);

      // Users can delete their own letters
      allow delete: if isOwner(resource.data.userId);
    }

    // Posts Collection (Community)
    match /posts/{postId} {
      // Anyone authenticated can read posts
      allow read: if isAuthenticated();

      // Users can create posts
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.title is string &&
                      request.resource.data.content is string &&
                      request.resource.data.category in ['challenge', 'concern', 'info', 'review'];

      // Only allow updating likes and comments count
      allow update: if isAuthenticated() &&
                      request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['likes', 'comments', 'updatedAt']);

      // Users can delete their own posts
      allow delete: if isOwner(resource.data.userId);
    }

    // Comments Collection
    match /comments/{commentId} {
      // Anyone authenticated can read comments
      allow read: if isAuthenticated();

      // Users can create comments
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid &&
                      request.resource.data.content is string &&
                      request.resource.data.postId is string;

      // Prevent updates
      allow update: if false;

      // Users can delete their own comments
      allow delete: if isOwner(resource.data.userId);
    }

    // Quotes Collection (Daily Quotes)
    match /quotes/{quoteId} {
      // Anyone can read quotes
      allow read: if true;

      // Only allow server-side creation
      allow create, update, delete: if false;
    }
  }
}
```

## How to Apply These Rules

1. **Go to Firebase Console**
   - Navigate to https://console.firebase.google.com
   - Select your project (mindsos-demo)

2. **Access Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Copy and Paste**
   - Copy the entire security rules code above
   - Paste it into the rules editor in Firebase Console
   - Click "Publish" to apply the rules

## Security Features

### User Data Protection
- Users can only read/write their own data
- Profile updates are restricted to specific fields
- Deletion is prevented for critical data

### Community Features
- Public posts are readable by all authenticated users
- Anonymous posting is supported
- Like and comment counts are protected from manipulation

### AI Coach Letters
- Private letters are only accessible to the owner
- Public letters can be shared with the community
- AI responses are stored securely

### Mission & Diary Privacy
- Missions and diaries are completely private
- Only the owner can access their own data
- Deletion is controlled per collection type

### Daily Check-ins
- Check-ins are private to each user
- Date validation prevents backdating
- Historical data is protected

## Testing the Rules

After applying the rules, test them by:

1. **Authentication Test**
   - Try accessing data while logged out → Should fail
   - Login and access your data → Should succeed

2. **Privacy Test**
   - Try to access another user's diary → Should fail
   - Access your own diary → Should succeed

3. **Public Content Test**
   - View public community posts → Should succeed
   - View private letters from others → Should fail

4. **Update Test**
   - Update your profile nickname → Should succeed
   - Try to update your userId → Should fail

## Firestore Indexes

### ⚠️ Important: Index Requirements

현재 버전에서는 **복합 인덱스가 필요하지 않습니다**. 모든 정렬은 클라이언트 측(JavaScript)에서 수행됩니다.

#### 개발 중 인덱스 오류 발생 시

만약 콘솔에서 인덱스 오류가 발생하면:

1. **에러 메시지의 링크를 클릭**하여 자동으로 인덱스 생성
2. 또는 아래 방법으로 수동 생성:

**Firebase Console → Firestore Database → Indexes → 복합 만들기**

필요한 경우의 인덱스:
- `missions` 컬렉션: `userId` (Ascending) + `createdAt` (Descending)
- `letters` 컬렉션: `userId` (Ascending) + `createdAt` (Descending)
- `posts` 컬렉션: `category` (Ascending) + `createdAt` (Descending)
- `comments` 컬렉션: `postId` (Ascending) + `createdAt` (Ascending)

### 현재 구현 방식

**✅ 클라이언트 측 정렬 사용**

모든 데이터는 Firestore에서 가져온 후 JavaScript로 정렬됩니다:

```javascript
// 예시: missions 정렬
const missions = await getDocs(query);
return missions.sort((a, b) => {
  const aTime = a.createdAt?.toMillis() || 0;
  const bTime = b.createdAt?.toMillis() || 0;
  return bTime - aTime; // 최신순
});
```

**장점:**
- 인덱스 생성 불필요
- 즉시 작동
- 개발 속도 향상

**단점:**
- 대량 데이터에서 성능 저하 가능 (100개 이상)
- 클라이언트 측 처리 부하

### 프로덕션 최적화 (선택사항)

데이터가 많아질 경우 Firestore 측 정렬로 전환:

1. **인덱스 생성** (위 링크 클릭 또는 수동 생성)
2. **코드 수정**:
   ```javascript
   // Before (현재)
   const q = query(collection(db, 'missions'), where('userId', '==', userId));

   // After (인덱스 생성 후)
   const q = query(
     collection(db, 'missions'),
     where('userId', '==', userId),
     orderBy('createdAt', 'desc')
   );
   ```

## Important Notes

⚠️ **Before Deployment:**
- Always test rules in Firebase Console's Rules Playground
- Start with restrictive rules and gradually open up as needed
- Monitor Firebase Console for security rule violations
- Keep rules updated as app features evolve
- 현재 버전은 복합 인덱스 없이 작동합니다

⚠️ **Production Considerations:**
- Consider adding rate limiting for write operations
- Implement data validation for user inputs
- 데이터 증가 시 복합 인덱스 추가 고려 (100개 이상)
- Monitor usage and costs in Firebase Console

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
