import type { User, DailyCheckIn, Mission, Letter, Post, Comment } from '@/types';
import { mockUser, mockMissions, mockQuotes } from './mockData';

// ==================== User Operations ====================

export const createUserProfile = async (userId: string, data: Partial<User>) => {
  // Mock implementation - do nothing
  console.log('Mock: createUserProfile', userId, data);
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  // Return mock user
  return mockUser;
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  // Mock implementation - do nothing
  console.log('Mock: updateUserProfile', userId, data);
};

// ==================== Daily Check-In ====================

export const saveDailyCheckIn = async (userId: string, data: Omit<DailyCheckIn, 'userId' | 'date'>) => {
  // Mock implementation - do nothing
  console.log('Mock: saveDailyCheckIn', userId, data);
};

export const getTodayCheckIn = async (userId: string): Promise<DailyCheckIn | null> => {
  // Mock implementation - return null
  return null;
};

// ==================== Diary Operations ====================

export const saveDiary = async (userId: string, content: string) => {
  // Mock implementation - do nothing
  console.log('Mock: saveDiary', userId, content);
};

export const getTodayDiary = async (userId: string): Promise<string | null> => {
  // Mock implementation - return null
  return null;
};

export const getDiaries = async (userId: string, limitCount: number = 30) => {
  // Mock implementation - return empty array
  return [];
};

// ==================== Mission Operations ====================

export const createMission = async (userId: string, mission: Omit<Mission, 'id' | 'userId' | 'createdAt'>) => {
  // Mock implementation - return fake id
  console.log('Mock: createMission', userId, mission);
  return 'mock-mission-id';
};

export const getUserMissions = async (userId: string): Promise<Mission[]> => {
  // Return mock missions
  return mockMissions;
};

export const updateMission = async (missionId: string, data: Partial<Mission>) => {
  // Mock implementation - do nothing
  console.log('Mock: updateMission', missionId, data);
};

export const deleteMission = async (missionId: string) => {
  // Mock implementation - do nothing
  console.log('Mock: deleteMission', missionId);
};

// ==================== Letter Operations ====================

export const createLetter = async (userId: string, letter: Omit<Letter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  // Mock implementation - return fake id
  console.log('Mock: createLetter', userId, letter);
  return 'mock-letter-id';
};

export const getLetters = async (userId?: string, isPrivate?: boolean): Promise<Letter[]> => {
  // Mock implementation - return empty array
  return [];
};

export const updateLetter = async (letterId: string, data: Partial<Letter>) => {
  // Mock implementation - do nothing
  console.log('Mock: updateLetter', letterId, data);
};

export const deleteLetter = async (letterId: string) => {
  // Mock implementation - do nothing
  console.log('Mock: deleteLetter', letterId);
};

// ==================== Post Operations ====================

export const createPost = async (userId: string, authorName: string, post: Omit<Post, 'id' | 'userId' | 'authorName' | 'createdAt' | 'likes' | 'comments'>) => {
  // Mock implementation - return fake id
  console.log('Mock: createPost', userId, authorName, post);
  return 'mock-post-id';
};

export const getPosts = async (category?: string, limitCount: number = 30): Promise<Post[]> => {
  // Mock implementation - return empty array
  return [];
};

export const getPopularPosts = async (limitCount: number = 30): Promise<Post[]> => {
  // Mock implementation - return empty array
  return [];
};

export const likePost = async (postId: string) => {
  // Mock implementation - do nothing
  console.log('Mock: likePost', postId);
};

export const deletePost = async (postId: string) => {
  // Mock implementation - do nothing
  console.log('Mock: deletePost', postId);
};

// ==================== Comment Operations ====================

export const createComment = async (comment: Omit<Comment, 'id' | 'createdAt'>) => {
  // Mock implementation - return fake id
  console.log('Mock: createComment', comment);
  return 'mock-comment-id';
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  // Mock implementation - return empty array
  return [];
};

export const deleteComment = async (commentId: string, postId: string) => {
  // Mock implementation - do nothing
  console.log('Mock: deleteComment', commentId, postId);
};

// ==================== Quote Operations ====================

export const getTodayQuote = async (): Promise<{ text: string; author: string }> => {
  // Return random mock quote
  const randomQuote = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
  return {
    text: randomQuote.text,
    author: randomQuote.author,
  };
};
