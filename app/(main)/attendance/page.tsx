'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockAttendance } from '@/lib/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function AttendancePage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get attendance for a specific date
  const getAttendanceForDate = (date: Date) => {
    return mockAttendance.find(attendance => isSameDay(new Date(attendance.date), date));
  };

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get the starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Calculate total cells needed
  const totalCells = Math.ceil((daysInMonth.length + startingDayOfWeek) / 7) * 7;
  const emptyCellsBefore = Array(startingDayOfWeek).fill(null);
  const emptyCellsAfter = Array(totalCells - daysInMonth.length - startingDayOfWeek).fill(null);

  // Calculate statistics
  const totalAttendance = mockAttendance.filter(a => a.checked).length;
  const currentStreak = mockAttendance.filter(a => a.checked).length >= 7 ? 7 : mockAttendance.filter(a => a.checked).length;
  const thisMonthAttendance = mockAttendance.filter(a =>
    a.checked &&
    isSameDay(startOfMonth(new Date(a.date)), monthStart)
  ).length;

  // Trophy achievements
  const achievements = [
    {
      title: '7일 연속 출석',
      description: '일주일 연속 출석 달성',
      achieved: currentStreak >= 7,
      icon: '🔥'
    },
    {
      title: '30일 연속 출석',
      description: '한 달 연속 출석 달성',
      achieved: totalAttendance >= 30,
      icon: '⭐'
    },
    {
      title: '100일 출석',
      description: '총 100일 출석 달성',
      achieved: totalAttendance >= 100,
      icon: '🏆'
    },
    {
      title: '완벽한 한 달',
      description: '이번 달 모든 날 출석',
      achieved: thisMonthAttendance >= daysInMonth.length,
      icon: '💯'
    },
  ];

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Simple Header with Stats */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-sage-500 to-sage-600 text-white px-4 sm:px-6 pt-safe pt-6 pb-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-manipulation"
            aria-label="홈으로 이동"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">출석 현황</h1>
            <p className="text-xs text-sage-100">꾸준함이 만드는 기적</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/90 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div className="text-2xl font-bold text-gray-900">{currentStreak}</div>
            </div>
            <div className="text-[10px] text-gray-600">연속 출석</div>
          </div>
          <div className="bg-white/90 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarIcon className="w-4 h-4 text-sky-600" />
              <div className="text-2xl font-bold text-gray-900">{totalAttendance}</div>
            </div>
            <div className="text-[10px] text-gray-600">총 출석일</div>
          </div>
          <div className="bg-white/90 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 bg-coral-500 rounded-full"></div>
              <div className="text-2xl font-bold text-gray-900">{thisMonthAttendance}</div>
            </div>
            <div className="text-[10px] text-gray-600">이번 달</div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between bg-white/90 rounded-xl px-3 py-2.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {format(currentMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
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
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-lavender-500' : 'text-gray-600'
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
              const attendance = getAttendanceForDate(date);
              const isToday = isSameDay(date, new Date());
              const dayOfWeek = date.getDay();

              return (
                <div
                  key={date.toString()}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 ${
                    attendance?.checked
                      ? 'bg-gradient-to-br from-lavender-500 to-lavender-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-400'
                  } ${isToday ? 'ring-2 ring-lavender-500' : ''}`}
                >
                  <span className={`text-sm sm:text-base font-medium mb-1`}>
                    {format(date, 'd')}
                  </span>
                  {attendance?.checked && (
                    <span className="text-lg">✓</span>
                  )}
                </div>
              );
            })}

            {/* Empty cells after month ends */}
            {emptyCellsAfter.map((_, index) => (
              <div key={`empty-after-${index}`} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            달성 현황
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className={`rounded-xl p-4 transition-all ${
                  achievement.achieved
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.achieved ? 'text-yellow-900' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm mt-0.5 ${achievement.achieved ? 'text-yellow-700' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.achieved && (
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
