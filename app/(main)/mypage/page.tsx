'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Trophy, FileText, Bookmark, Bell, HelpCircle, FileCheck, LogOut, ChevronRight, Settings, Loader2, Edit } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { updateUserProfile } from '@/lib/firestore';
import { mockPosts } from '@/lib/mockData';

export default function MyPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [updating, setUpdating] = useState(false);

  // Count user's posts
  const userPostsCount = mockPosts.filter(p => p.userId === (user?.uid || 'mock-user-1')).length;

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
    }
  };

  const handleEditProfile = () => {
    setEditName(userProfile?.displayName || '');
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!user || !editName.trim()) return;

    try {
      setUpdating(true);
      await updateUserProfile(user.uid, {
        displayName: editName,
      });
      setShowEditModal(false);
      window.location.reload(); // Reload to get updated profile
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const menuItems = [
    {
      icon: FileText,
      label: '내가 작성한 글',
      count: userPostsCount,
      color: 'text-primary-600 bg-gradient-to-br from-primary-100 to-primary-200',
      onClick: () => router.push('/community'),
    },
    {
      icon: Bookmark,
      label: '저장한 글',
      count: 0,
      color: 'text-accent-600 bg-gradient-to-br from-accent-100 to-accent-200',
      onClick: () => alert('저장 기능은 준비 중입니다'),
    },
    {
      icon: Trophy,
      label: '획득한 트로피',
      count: 1,
      color: 'text-yellow-600 bg-gradient-to-br from-yellow-100 to-orange-100',
      onClick: () => alert('트로피 기능은 준비 중입니다'),
    },
  ];

  const settingItems = [
    { icon: Bell, label: '알림 설정', onClick: () => alert('알림 설정 기능은 준비 중입니다') },
    { icon: HelpCircle, label: 'FAQ', onClick: () => router.push('/faq') },
    { icon: FileCheck, label: '공지사항', onClick: () => router.push('/notice') },
    { icon: Settings, label: '서비스 약관', onClick: () => alert('서비스 약관 페이지는 준비 중입니다') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary-600 border-r-secondary-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Modern Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white px-6 pt-safe pt-10 pb-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">마이페이지</h1>
          <p className="text-white/80 text-base font-medium">나의 성장 기록</p>
        </div>
      </div>

      {/* Floating 3D Profile Card */}
      <div className="px-6 -mt-16 relative z-20 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-primary-500/20 border border-primary-100/50 hover:shadow-3xl hover:shadow-primary-500/30 hover:-translate-y-1 transition-all">
          <div className="flex items-start gap-4 mb-6">
            {/* Modern Gradient Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary-500/30">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-sm text-white font-bold">✓</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1 truncate tracking-tight">
                {userProfile?.displayName || '사용자'}
              </h2>
              <p className="text-sm text-neutral-500 mb-3 truncate font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 text-xs text-primary-700 bg-gradient-to-r from-primary-100 to-secondary-100 px-4 py-2 rounded-2xl inline-flex font-bold shadow-sm">
                <Trophy className="w-4 h-4" />
                <span>{userProfile?.streak || 0}일 연속 출석</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditProfile}
              className="flex-shrink-0 p-3 hover:bg-primary-50 rounded-2xl transition-all touch-manipulation group"
              aria-label="프로필 수정"
            >
              <Edit className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
            </button>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-neutral-100">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1">
                {userProfile?.streak || 0}
              </div>
              <div className="text-xs text-neutral-500 font-semibold">출석일수</div>
            </div>
            <div className="text-center border-l border-neutral-200">
              <div className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1">0</div>
              <div className="text-xs text-neutral-500 font-semibold">작성글</div>
            </div>
            <div className="text-center border-l border-neutral-200">
              <div className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1">1</div>
              <div className="text-xs text-neutral-500 font-semibold">트로피</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Menu */}
      <div className="px-6 mb-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-500">{item.count}개</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Settings Menu */}
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 px-2">설정</h3>
        <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
          {settingItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-left text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>

      {/* Version Info */}
      <div className="text-center text-sm text-gray-400 pb-6">
        MindSOS v1.0.0
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">프로필 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  닉네임
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                disabled={updating}
              >
                취소
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={!editName.trim() || updating}
                className="flex-1 px-4 py-3 bg-lavender-500 text-white rounded-xl font-medium hover:bg-lavender-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    업데이트 중
                  </>
                ) : (
                  '저장'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
