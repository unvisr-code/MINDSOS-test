'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Trophy, FileText, Bookmark, Bell, HelpCircle, FileCheck, LogOut, ChevronRight, Settings, Loader2, Edit } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { updateUserProfile } from '@/lib/firestore';

export default function MyPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [updating, setUpdating] = useState(false);

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
      count: 0,
      color: 'text-indigo-600 bg-indigo-100',
      onClick: () => {},
    },
    {
      icon: Bookmark,
      label: '저장한 글',
      count: 0,
      color: 'text-pink-600 bg-pink-100',
      onClick: () => {},
    },
    {
      icon: Trophy,
      label: '획득한 트로피',
      count: 1,
      color: 'text-yellow-600 bg-yellow-100',
      onClick: () => {},
    },
  ];

  const settingItems = [
    { icon: Bell, label: '알림 설정', onClick: () => {} },
    { icon: HelpCircle, label: 'FAQ', onClick: () => router.push('/faq') },
    { icon: FileCheck, label: '공지사항', onClick: () => router.push('/notice') },
    { icon: Settings, label: '서비스 약관', onClick: () => {} },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-2">마이페이지</h1>
        <p className="text-indigo-100">나의 활동을 확인하세요</p>
      </div>

      {/* Profile Section */}
      <div className="px-6 -mt-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
              {userProfile?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{userProfile?.displayName || '사용자'}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleEditProfile}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-indigo-600">{userProfile?.streak || 0}</div>
              <div className="text-xs text-gray-500 mt-1">출석일수</div>
            </div>
            <div className="flex-1 text-center border-l border-gray-200">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-xs text-gray-500 mt-1">작성글</div>
            </div>
            <div className="flex-1 text-center border-l border-gray-200">
              <div className="text-2xl font-bold text-pink-600">1</div>
              <div className="text-xs text-gray-500 mt-1">트로피</div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
