'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockDiaries } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

const emotions = {
  happy: { emoji: '😊', label: '행복해요' },
  sad: { emoji: '😢', label: '슬퍼요' },
  anxious: { emoji: '😰', label: '불안해요' },
  calm: { emoji: '😌', label: '차분해요' },
  stressed: { emoji: '😫', label: '스트레스' },
};

export default function DiaryPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get diary for a specific date
  const getDiaryForDate = (date: Date) => {
    return mockDiaries.find(diary => isSameDay(new Date(diary.date), date));
  };

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const diary = getDiaryForDate(date);
    if (diary) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  // Get the starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Calculate total cells needed (including empty cells)
  const totalCells = Math.ceil((daysInMonth.length + startingDayOfWeek) / 7) * 7;
  const emptyCellsBefore = Array(startingDayOfWeek).fill(null);
  const emptyCellsAfter = Array(totalCells - daysInMonth.length - startingDayOfWeek).fill(null);

  const selectedDiary = selectedDate ? getDiaryForDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">한 줄 일기</h1>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells before month starts */}
            {emptyCellsBefore.map((_, index) => (
              <div key={`empty-before-${index}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {daysInMonth.map((date) => {
              const diary = getDiaryForDate(date);
              const isToday = isSameDay(date, new Date());
              const dayOfWeek = date.getDay();

              return (
                <button
                  key={date.toString()}
                  onClick={() => handleDateClick(date)}
                  disabled={!diary}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all touch-manipulation ${
                    diary
                      ? 'bg-white shadow-sm hover:shadow-md active:scale-95'
                      : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <span
                    className={`text-sm sm:text-base font-medium mb-1 ${
                      !diary
                        ? 'text-gray-400'
                        : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                        ? 'text-blue-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  {diary && (
                    <span className="text-2xl sm:text-3xl">
                      {emotions[diary.emotion].emoji}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Empty cells after month ends */}
            {emptyCellsAfter.map((_, index) => (
              <div key={`empty-after-${index}`} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">일기 통계</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockDiaries.length}</div>
              <div className="text-xs opacity-90 mt-1">작성한 일기</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {mockDiaries.filter(d => d.emotion === 'happy').length}
              </div>
              <div className="text-xs opacity-90 mt-1">행복한 날</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(mockDiaries.map(d => format(new Date(d.date), 'yyyy-MM'))).size}
              </div>
              <div className="text-xs opacity-90 mt-1">활동한 달</div>
            </div>
          </div>
        </div>
      </div>

      {/* Diary Detail Modal */}
      {showModal && selectedDiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate && format(selectedDate, 'M월 d일 (E)', { locale: ko })}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className="text-4xl">{emotions[selectedDiary.emotion].emoji}</span>
              <span className="text-gray-600">{emotions[selectedDiary.emotion].label}</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 leading-relaxed">{selectedDiary.content}</p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
