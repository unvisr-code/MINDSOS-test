import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, DailyCheckIn, Mission, Letter, Post, Comment, Trophy } from '@/types';

// ==================== User Operations ====================

export const createUserProfile = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    streak: 0,
    lastCheckIn: null,
  });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

// ==================== Daily Check-In ====================

export const saveDailyCheckIn = async (userId: string, data: Omit<DailyCheckIn, 'userId' | 'date'>) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInRef = doc(db, 'checkIns', `${userId}_${today.getTime()}`);
  await setDoc(checkInRef, {
    userId,
    date: Timestamp.fromDate(today),
    ...data,
    createdAt: serverTimestamp(),
  });

  // Update user streak
  await updateUserStreak(userId);
};

export const getTodayCheckIn = async (userId: string): Promise<DailyCheckIn | null> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInRef = doc(db, 'checkIns', `${userId}_${today.getTime()}`);
  const checkInSnap = await getDoc(checkInRef);

  if (checkInSnap.exists()) {
    return checkInSnap.data() as DailyCheckIn;
  }
  return null;
};

const updateUserStreak = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const lastCheckIn = userData.lastCheckIn?.toDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;

  if (lastCheckIn) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCheckIn.getTime() === yesterday.getTime()) {
      newStreak = (userData.streak || 0) + 1;
    }
  }

  await updateDoc(userRef, {
    streak: newStreak,
    lastCheckIn: Timestamp.fromDate(today),
  });
};

// ==================== Diary Operations ====================

export const saveDiary = async (userId: string, content: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diaryRef = doc(db, 'diaries', `${userId}_${today.getTime()}`);
  await setDoc(diaryRef, {
    userId,
    content,
    date: Timestamp.fromDate(today),
    createdAt: serverTimestamp(),
  });
};

export const getTodayDiary = async (userId: string): Promise<string | null> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diaryRef = doc(db, 'diaries', `${userId}_${today.getTime()}`);
  const diarySnap = await getDoc(diaryRef);

  if (diarySnap.exists()) {
    return diarySnap.data().content;
  }
  return null;
};

export const getDiaries = async (userId: string, limitCount: number = 30) => {
  const q = query(
    collection(db, 'diaries'),
    where('userId', '==', userId),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  const diaries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Sort in JavaScript instead of Firestore
  return diaries.sort((a: any, b: any) => {
    const aTime = a.date && typeof a.date.toMillis === 'function' ? a.date.toMillis() : 0;
    const bTime = b.date && typeof b.date.toMillis === 'function' ? b.date.toMillis() : 0;
    return bTime - aTime;
  });
};

// ==================== Mission Operations ====================

export const createMission = async (userId: string, mission: Omit<Mission, 'id' | 'userId' | 'createdAt'>) => {
  const missionsRef = collection(db, 'missions');
  const docRef = await addDoc(missionsRef, {
    userId,
    ...mission,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserMissions = async (userId: string): Promise<Mission[]> => {
  const q = query(
    collection(db, 'missions'),
    where('userId', '==', userId)
    // orderBy removed temporarily - will be added back after index is created
  );

  const snapshot = await getDocs(q);
  // Sort in JavaScript instead
  const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
  return missions.sort((a, b) => {
    const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
    const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
    return bTime - aTime;
  });
};

export const updateMission = async (missionId: string, data: Partial<Mission>) => {
  const missionRef = doc(db, 'missions', missionId);
  await updateDoc(missionRef, {
    ...data,
    ...(data.completed && { completedAt: serverTimestamp() }),
  });
};

export const deleteMission = async (missionId: string) => {
  const missionRef = doc(db, 'missions', missionId);
  await deleteDoc(missionRef);
};

// ==================== Letter Operations ====================

export const createLetter = async (userId: string, letter: Omit<Letter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  const lettersRef = collection(db, 'letters');
  const docRef = await addDoc(lettersRef, {
    userId,
    ...letter,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getLetters = async (userId?: string, isPrivate?: boolean): Promise<Letter[]> => {
  let q;

  if (userId) {
    q = query(collection(db, 'letters'), where('userId', '==', userId));
  } else if (isPrivate === false) {
    q = query(collection(db, 'letters'), where('isPrivate', '==', false), limit(50));
  } else {
    q = query(collection(db, 'letters'), limit(50));
  }

  const snapshot = await getDocs(q);
  const letters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Letter));

  // Sort in JavaScript instead of Firestore
  return letters.sort((a, b) => {
    const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
    const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
    return bTime - aTime;
  });
};

export const updateLetter = async (letterId: string, data: Partial<Letter>) => {
  const letterRef = doc(db, 'letters', letterId);
  await updateDoc(letterRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteLetter = async (letterId: string) => {
  const letterRef = doc(db, 'letters', letterId);
  await deleteDoc(letterRef);
};

// ==================== Post Operations ====================

export const createPost = async (userId: string, authorName: string, post: Omit<Post, 'id' | 'userId' | 'authorName' | 'createdAt' | 'likes' | 'comments'>) => {
  const postsRef = collection(db, 'posts');
  const docRef = await addDoc(postsRef, {
    userId,
    authorName,
    ...post,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getPosts = async (category?: string, limitCount: number = 30): Promise<Post[]> => {
  let q;

  if (category && category !== 'all') {
    q = query(
      collection(db, 'posts'),
      where('category', '==', category),
      limit(limitCount)
    );
  } else {
    q = query(collection(db, 'posts'), limit(limitCount));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

  // Sort in JavaScript instead of Firestore
  return posts.sort((a, b) => {
    const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
    const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
    return bTime - aTime;
  });
};

export const getPopularPosts = async (limitCount: number = 30): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    limit(limitCount * 2) // Get more to ensure we have enough after sorting
  );

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

  // Sort by likes first, then by createdAt
  return posts
    .sort((a, b) => {
      if (b.likes !== a.likes) {
        return b.likes - a.likes;
      }
      const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
      const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
      return bTime - aTime;
    })
    .slice(0, limitCount);
};

export const likePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: increment(1),
  });
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
};

// ==================== Comment Operations ====================

export const createComment = async (comment: Omit<Comment, 'id' | 'createdAt'>) => {
  const commentsRef = collection(db, 'comments');
  const docRef = await addDoc(commentsRef, {
    ...comment,
    createdAt: serverTimestamp(),
  });

  // Increment comment count
  const postRef = doc(db, 'posts', comment.postId);
  await updateDoc(postRef, {
    comments: increment(1),
  });

  return docRef.id;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId)
  );

  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));

  // Sort in JavaScript instead of Firestore
  return comments.sort((a, b) => {
    const aTime = a.createdAt && typeof (a.createdAt as any).toMillis === 'function' ? (a.createdAt as any).toMillis() : 0;
    const bTime = b.createdAt && typeof (b.createdAt as any).toMillis === 'function' ? (b.createdAt as any).toMillis() : 0;
    return aTime - bTime; // Ascending order (oldest first)
  });
};

export const deleteComment = async (commentId: string, postId: string) => {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);

  // Decrement comment count
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: increment(-1),
  });
};

// ==================== Quote Operations ====================

export const getTodayQuote = async (): Promise<{ text: string; author: string }> => {
  const q = query(collection(db, 'quotes'), limit(10));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return {
      text: '마음이 평온할 때, 당신은 가장 강력한 당신이 됩니다.',
      author: '익명',
    };
  }

  const quotes = snapshot.docs.map(doc => doc.data());
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return randomQuote as { text: string; author: string };
};
