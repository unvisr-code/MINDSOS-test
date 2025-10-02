'use client';

import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Search, TrendingUp, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { getPosts, getPopularPosts, createPost, likePost, getComments, createComment } from '@/lib/firestore';
import { mockPosts, mockComments } from '@/lib/mockData';
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

  // New comment
  const [newComment, setNewComment] = useState('');

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

  const handleLikePost = async (postId: string) => {
    try {
      if (!USE_MOCK_DATA) {
        await likePost(postId);
      }

      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
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
              <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                {categories.find(c => c.id === selectedPost.category)?.label}
              </span>
              <span className="text-xs text-gray-500">
                {selectedPost.createdAt && new Date(selectedPost.createdAt.toString()).toLocaleDateString('ko-KR')}
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
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{selectedPost.likes}</span>
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
                        {comment.createdAt && new Date(comment.createdAt.toString()).toLocaleDateString('ko-KR')}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateComment()}
                />
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-pink-600 font-semibold hover:text-pink-700 disabled:opacity-50 flex items-center gap-2"
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

        <div className="px-6 py-6 space-y-4">
          <select
            value={newPostCategory}
            onChange={(e) => setNewPostCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={submitting}
          >
            <option value="challenge">챌린지 인증</option>
            <option value="concern">고민 나눔</option>
            <option value="info">정보 공유</option>
            <option value="review">후기</option>
          </select>

          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="제목"
            className="w-full text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-pink-600 focus:ring-0 pb-2"
            disabled={submitting}
          />

          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            className="w-full h-64 border-0 focus:ring-0 resize-none text-gray-700"
            disabled={submitting}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              disabled={submitting}
            />
            <span className="text-sm text-gray-700">익명으로 작성</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-orange-600 text-white px-4 sm:px-6 pt-safe pt-8 sm:pt-12 pb-4 sm:pb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">마음 라운지</h1>
        <p className="text-pink-100 text-sm sm:text-base">함께 나누고 성장해요</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 sm:px-4 py-2">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="flex-1 bg-transparent border-0 focus:ring-0 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 sm:gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-colors touch-manipulation ${
                activeCategory === category.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-3 sm:py-4 text-center font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base touch-manipulation ${
              activeTab === 'popular'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            인기글
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-3 sm:py-4 text-center font-medium transition-colors text-sm sm:text-base touch-manipulation ${
              activeTab === 'recent'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
            }`}
          >
            최신글
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm sm:text-base">게시글이 없습니다</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">첫 게시글을 작성해보세요</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md active:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                  {categories.find(c => c.id === post.category)?.label}
                </span>
                <span className="text-xs text-gray-500">
                  {post.createdAt && new Date(post.createdAt.toString()).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">{post.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{post.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{post.authorName}</span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl active:shadow-md transition-all flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation z-40"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}
