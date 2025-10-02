export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  age?: number;
  createdAt: Date;
  streak: number;
  lastCheckIn?: Date;
}

export interface DailyCheckIn {
  userId: string;
  date: Date;
  emotion: 'happy' | 'sad' | 'anxious' | 'calm' | 'stressed';
  stress: number; // 1-5
  energy: number; // 1-5
  sleep: number; // hours
  note?: string;
}

export interface Mission {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  recurring: boolean;
}

export interface Letter {
  id: string;
  userId: string;
  title: string;
  content: string;
  aiResponse?: string;
  isPrivate: boolean;
  coachId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  category: 'challenge' | 'concern' | 'info' | 'review';
  title: string;
  content: string;
  isAnonymous: boolean;
  likes: number;
  comments: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Trophy {
  id: string;
  userId: string;
  type: 'attendance' | 'mission' | 'special';
  title: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  imageUrl?: string;
  date: Date;
}

export interface AICoach {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: string;
  description: string;
  style: string;
}

export interface Diary {
  id: string;
  userId: string;
  content: string;
  emotion: 'happy' | 'sad' | 'anxious' | 'calm' | 'stressed';
  date: Date;
  createdAt: Date;
}

export interface Attendance {
  userId: string;
  date: Date;
  checked: boolean;
}
