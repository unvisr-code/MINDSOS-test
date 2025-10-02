'use client';

import { ChevronLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockNotices } from '@/lib/mockData';

export default function NoticePage() {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-sage-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/mypage')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label="마이페이지로 이동"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">공지사항</h1>
        </div>
      </div>

      {/* Notice List */}
      <div className="px-6 py-6 space-y-4">
        {mockNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-lavender-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-lavender-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {notice.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {notice.content}
                </p>
                <span className="text-xs text-gray-400">
                  {formatDate(notice.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
