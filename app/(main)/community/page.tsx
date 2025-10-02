'use client';

import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Search, TrendingUp, Loader2, Send, Image as ImageIcon, Smile } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { getPosts, getPopularPosts, createPost, likePost, getComments, createComment } from '@/lib/firestore';
import { mockPosts, mockComments } from '@/lib/mockData';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Post, Comment } from '@/types';

const USE_MOCK_DATA = true; // Toggle for demo

const categories = [
  { id: 'all', label: '전체' },
  { id: 'challenge', label: '챌린지 인증' },
  { id: 'concern', label: '고민 나눔' },
  { id: 'info', label: '정보 공유' },
  { id: 'review', label: '후기' },
];

export default function CommunityPage() {
  const { user, userProfile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'popular' | 'recent'>('popular');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New post form
  const [newPostCategory, setNewPostCategory] = useState('challenge');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // New comment
  const [newComment, setNewComment] = useState('');

  // Like tracking
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
  }, [activeTab, activeCategory]);

  useEffect(() => {
    if (selectedPost) {
      loadComments(selectedPost.id);
    }
  }, [selectedPost]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let data: Post[];

      if (USE_MOCK_DATA) {
        // Use mock data for demo
        // First filter by category if not 'all'
        if (activeCategory !== 'all') {
          data = mockPosts.filter(p => p.category === activeCategory);
        } else {
          data = mockPosts;
        }

        // Then sort if popular tab
        if (activeTab === 'popular') {
          data = [...data].sort((a, b) => b.likes - a.likes);
        }
      } else {
        // Load from Firebase
        if (activeTab === 'popular') {
          data = await getPopularPosts(30);
        } else {
          data = await getPosts(activeCategory, 30);
        }
      }

      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Use mock data for demo
        const data = mockComments.filter(c => c.postId === postId);
        setComments(data);
      } else {
        // Load from Firebase
        const data = await getComments(postId);
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      setSubmitting(true);

      if (!USE_MOCK_DATA && user && userProfile) {
        await createPost(
          user.uid,
          isAnonymous ? '익명' : userProfile.displayName,
          {
            category: newPostCategory as any,
            title: newPostTitle,
            content: newPostContent,
            isAnonymous,
          }
        );
      }

      setShowNewPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      setIsAnonymous(false);

      if (USE_MOCK_DATA) {
        alert('게시글이 작성되었습니다! (데모 모드)');
      } else {
        loadPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering post click

    try {
      const isLiked = likedPosts.has(postId);
      const newLikedPosts = new Set(likedPosts);

      if (isLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }

      setLikedPosts(newLikedPosts);

      if (!USE_MOCK_DATA) {
        await likePost(postId);
      }

      const delta = isLiked ? -1 : 1;
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + delta } : p));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, likes: selectedPost.likes + delta });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCreateComment = async () => {
    if (!selectedPost || !newComment.trim()) return;

    try {
      if (!USE_MOCK_DATA && user && userProfile) {
        await createComment({
          postId: selectedPost.id,
          userId: user.uid,
          authorName: isAnonymous ? '익명' : userProfile.displayName,
          content: newComment,
          isAnonymous,
        });
      }

      setNewComment('');

      if (USE_MOCK_DATA) {
        // In mock mode, just show success message
        alert('댓글이 작성되었습니다! (데모 모드)');
      } else {
        loadComments(selectedPost.id);
        // Update comment count
        setPosts(posts.map(p =>
          p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p
        ));
        setSelectedPost({ ...selectedPost, comments: selectedPost.comments + 1 });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  // Post detail view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 목록으로
            </button>
            <h1 className="text-lg font-semibold">게시글</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Post content */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-peach-100 text-peach-700 text-xs font-medium rounded-full">
                {categories.find(c => c.id === selectedPost.category)?.label}
              </span>
              <span className="text-xs text-gray-500">
                {selectedPost.createdAt && format(new Date(selectedPost.createdAt.toString()), 'M월 d일', { locale: ko })}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedPost.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
              {selectedPost.content}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">{selectedPost.authorName}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => handleLikePost(selectedPost.id, e)}
                  className={`flex items-center gap-1 transition-all touch-manipulation group ${
                    likedPosts.has(selectedPost.id)
                      ? 'text-accent-500'
                      : 'text-gray-500 hover:text-accent-500'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      likedPosts.has(selectedPost.id)
                        ? 'fill-accent-500 scale-110'
                        : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="text-sm font-semibold">{selectedPost.likes}</span>
                </button>
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{selectedPost.comments}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              댓글 {comments.length}개
            </h3>

            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                첫 댓글을 작성해보세요
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt && format(new Date(comment.createdAt.toString()), 'M월 d일', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateComment()}
                />
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-lavender-500 text-white rounded-xl hover:bg-lavender-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New post form
  if (showNewPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowNewPost(false)}
              className="text-gray-600 hover:text-gray-900"
              disabled={submitting}
            >
              취소
            </button>
            <h1 className="text-lg font-semibold">글쓰기</h1>
            <button
              onClick={handleCreatePost}
              disabled={!newPostTitle || !newPostContent || submitting}
              className="text-lavender-600 font-semibold hover:text-lavender-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  작성 중
                </>
              ) : (
                '완료'
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Category Selection - Improved */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4 border-2 border-primary-200">
            <label className="text-sm font-semibold text-neutral-700 mb-3 block">카테고리 선택</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'challenge', label: '챌린지 인증', emoji: '🎯' },
                { value: 'concern', label: '고민 나눔', emoji: '💭' },
                { value: 'info', label: '정보 공유', emoji: '💡' },
                { value: 'review', label: '후기', emoji: '⭐' }
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewPostCategory(cat.value)}
                  disabled={submitting}
                  className={`p-3 rounded-xl font-medium text-sm transition-all touch-manipulation ${
                    newPostCategory === cat.value
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg scale-105'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 shadow-md'
                  }`}
                >
                  <span className="text-lg mr-2">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emotion Tags */}
          <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl p-4 border-2 border-accent-200">
            <label className="text-sm font-semibold text-neutral-700 mb-3 block flex items-center gap-2">
              <Smile className="w-4 h-4" />
              지금 기분은 어떠세요?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'happy', emoji: '😊', label: '기쁨' },
                { id: 'calm', emoji: '😌', label: '평온' },
                { id: 'anxious', emoji: '😰', label: '불안' },
                { id: 'sad', emoji: '😢', label: '슬픔' },
                { id: 'stressed', emoji: '😫', label: '스트레스' },
                { id: 'hopeful', emoji: '🌟', label: '희망' }
              ].map((emotion) => (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => setSelectedEmotion(selectedEmotion === emotion.id ? null : emotion.id)}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all touch-manipulation ${
                    selectedEmotion === emotion.id
                      ? 'bg-gradient-to-r from-accent-500 to-primary-500 text-white shadow-lg scale-105'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg mr-1">{emotion.emoji}</span>
                  {emotion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-primary-600 focus:ring-0 pb-3 px-2"
            disabled={submitting}
          />

          {/* Content */}
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            className="w-full h-64 border-0 focus:ring-0 resize-none text-gray-700 px-2"
            disabled={submitting}
          />

          {/* Image Upload Placeholder */}
          <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-dashed border-neutral-300 hover:border-primary-400 transition-colors">
            <button
              type="button"
              className="w-full flex flex-col items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors touch-manipulation"
              disabled={submitting}
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm font-medium">이미지 추가 (준비 중)</span>
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={submitting}
              />
              <span className="text-sm text-gray-700 font-medium">익명으로 작성</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Modern Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white px-6 pt-safe pt-10 pb-8 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">커뮤니티</h1>
          <p className="text-white/80 text-base font-medium">함께 나누고 성장하는 공간</p>
        </div>
      </div>

      {/* Floating Search and Categories */}
      <div className="px-6 -mt-8 relative z-30 mb-6">
        {/* Glassmorphism Search Bar */}
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl shadow-primary-500/10 border border-white/50">
          <input
            type="text"
            placeholder="게시글, 태그 검색..."
            className="w-full bg-transparent border-none text-neutral-900 placeholder-neutral-400 px-4 py-3 focus:outline-none text-base font-medium"
            aria-label="게시글 검색"
          />
          <div className="absolute right-7 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
            <Search className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Category Pills - Improved Scroll */}
      <div className="px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all touch-manipulation flex-shrink-0 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:scale-105 shadow-md'
              }`}
              aria-label={`${category.label} 카테고리`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-0 z-20 shadow-sm">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-4 text-center font-semibold transition-all flex items-center justify-center gap-2 text-base touch-manipulation ${
              activeTab === 'popular'
                ? 'text-primary-600 border-b-3 border-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            인기글
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-4 text-center font-semibold transition-all text-base touch-manipulation ${
              activeTab === 'recent'
                ? 'text-primary-600 border-b-3 border-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            최신글
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="relative mx-auto w-16 h-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary-600 border-r-secondary-600 absolute top-0 left-0"></div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-primary-500" />
            </div>
            <p className="text-neutral-600 text-base font-medium mb-1">게시글이 없습니다</p>
            <p className="text-sm text-neutral-400">첫 게시글을 작성해보세요</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-3xl p-6 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all cursor-pointer touch-manipulation border border-neutral-100/50"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-accent-100 to-primary-100 text-accent-700 text-xs font-bold rounded-2xl">
                  {categories.find(c => c.id === post.category)?.label}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {post.createdAt && format(new Date(post.createdAt.toString()), 'M월 d일', { locale: ko })}
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 mb-2 text-lg tracking-tight group-hover:text-primary-600 transition-colors">{post.title}</h3>
              <p className="text-neutral-600 text-base mb-4 line-clamp-2 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-sm text-neutral-500 font-medium truncate max-w-[160px]">{post.authorName}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleLikePost(post.id, e)}
                    className={`flex items-center gap-1.5 transition-all touch-manipulation group/like ${
                      likedPosts.has(post.id)
                        ? 'text-accent-500'
                        : 'text-neutral-500 hover:text-accent-500'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        likedPosts.has(post.id)
                          ? 'fill-accent-500 scale-110'
                          : 'group-hover/like:scale-110'
                      }`}
                    />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button - Enhanced */}
      <button
        onClick={() => setShowNewPost(true)}
        className="group fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white rounded-2xl shadow-2xl shadow-primary-500/40 hover:shadow-3xl hover:shadow-primary-500/50 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all flex items-center justify-center touch-manipulation z-40"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
