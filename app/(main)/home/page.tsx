'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Share2, Download, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/lib/hooks';
import {
  saveDailyCheckIn,
  getTodayCheckIn,
  saveDiary,
  getTodayDiary,
  getUserMissions,
  updateMission,
  getTodayQuote,
} from '@/lib/firestore';
import { mockMissions, mockQuotes } from '@/lib/mockData';
import type { Mission } from '@/types';

const USE_MOCK_DATA = true; // Toggle this to use mock data for demo

const emotions = [
  { emoji: '😊', label: '행복해요', value: 'happy' as const },
  { emoji: '😢', label: '슬퍼요', value: 'sad' as const },
  { emoji: '😰', label: '불안해요', value: 'anxious' as const },
  { emoji: '😌', label: '차분해요', value: 'calm' as const },
  { emoji: '😫', label: '스트레스', value: 'stressed' as const },
];

export default function HomePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [selectedEmotion, setSelectedEmotion] = useState<'happy' | 'sad' | 'anxious' | 'calm' | 'stressed' | ''>('');
  const [diaryEmotion, setDiaryEmotion] = useState<'happy' | 'sad' | 'anxious' | 'calm' | 'stressed' | ''>('');
  const [diary, setDiary] = useState('');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [todayQuote, setTodayQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && userProfile) {
      loadData();
    }
  }, [authLoading, userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        // Use mock data for demo
        setMissions(mockMissions);
        setTodayQuote(mockQuotes[0]);
        setSelectedEmotion('happy');
      } else {
        if (!user) return;

        // Load from Firebase
        const checkIn = await getTodayCheckIn(user.uid);
        if (checkIn?.emotion) {
          setSelectedEmotion(checkIn.emotion);
        }

        const todayDiaryContent = await getTodayDiary(user.uid);
        if (todayDiaryContent) {
          setDiary(todayDiaryContent);
        }

        const userMissions = await getUserMissions(user.uid);
        setMissions(userMissions);

        const quote = await getTodayQuote();
        setTodayQuote(quote);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionSelect = async (emotion: typeof selectedEmotion) => {
    if (!emotion) return;

    setSelectedEmotion(emotion);

    if (!USE_MOCK_DATA && user) {
      try {
        await saveDailyCheckIn(user.uid, {
          emotion,
          stress: 3,
          energy: 3,
          sleep: 7,
        });
      } catch (error) {
        console.error('Error saving check-in:', error);
      }
    }
  };

  const toggleMission = async (missionId: string, currentStatus: boolean) => {
    try {
      await updateMission(missionId, { completed: !currentStatus });
      setMissions(missions.map(m =>
        m.id === missionId ? { ...m, completed: !currentStatus } : m
      ));
    } catch (error) {
      console.error('Error updating mission:', error);
    }
  };

  const handleSaveDiary = async () => {
    if (!diary.trim() || !diaryEmotion) return;

    try {
      setSaving(true);

      if (!USE_MOCK_DATA && user) {
        await saveDiary(user.uid, diary);
      }

      alert('일기가 저장되었습니다!');
      setDiary('');
      setDiaryEmotion('');
    } catch (error) {
      console.error('Error saving diary:', error);
      alert('일기 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareQuote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '오늘의 명언',
          text: `${todayQuote.text}\n- ${todayQuote.author}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('공유 기능이 지원되지 않는 브라우저입니다.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary-600 border-r-secondary-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  // Calculate mission completion rate with safe fallback
  const completionRate = missions.length > 0
    ? Math.round((missions.filter(m => m.completed).length / missions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Modern Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white px-6 pt-safe pt-10 pb-28 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Profile Section */}
        <div className="relative flex items-start gap-4 mb-8">
          {/* Modern Avatar with Gradient Border */}
          <div className="flex-shrink-0 p-1 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold bg-gradient-to-br from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {userProfile?.displayName?.charAt(0) || '😊'}
              </span>
            </div>
          </div>

          {/* Greeting */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white/80 text-sm tracking-wide mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold truncate tracking-tight">{userProfile?.displayName}님</h1>
            <p className="text-white/70 text-sm mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 bg-white/60 rounded-full"></span>
              {format(new Date(), 'M월 d일 EEEE', { locale: ko })}
            </p>
          </div>
        </div>

        {/* Floating Stats Cards with Neumorphism */}
        <div className="relative grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-primary-900/10 hover:shadow-xl transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-neutral-600 font-medium">연속 출석</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {userProfile?.streak || 0}일
            </div>
          </div>

          {/* Mission Completion Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-primary-900/10 hover:shadow-xl transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-neutral-600 font-medium">완료율</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-br from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Floating Attendance Card with 3D Effect */}
      <div className="px-6 -mt-16 relative z-20">
        <button
          onClick={() => router.push('/attendance')}
          className="group bg-white rounded-3xl p-6 w-full text-left shadow-xl shadow-primary-500/10 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 touch-manipulation border border-primary-100/50"
          aria-label="출석 현황 페이지로 이동"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 text-base tracking-tight">오늘의 출석 체크</h3>
            <span className="text-sm text-primary-700 bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-1.5 rounded-full font-semibold shadow-sm">
              {format(new Date(), 'M/d', { locale: ko })}
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  day <= (userProfile?.streak || 0)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-sm'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-600 text-center font-medium">
            {userProfile?.streak === 7 ? '🎉 7일 연속 달성!' : `${7 - (userProfile?.streak || 0)}일 남았어요`}
          </p>
        </button>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* 오늘의 명언 - Gradient Card */}
        {todayQuote.text && (
          <div className="relative bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 text-white rounded-3xl p-6 shadow-lg shadow-secondary-500/20 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative flex items-start justify-between mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <button
                onClick={handleShareQuote}
                className="p-2 hover:bg-white/20 active:bg-white/30 rounded-xl transition-all backdrop-blur-sm touch-manipulation"
                aria-label="명언 공유하기"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-lg font-semibold leading-relaxed mb-3 tracking-tight">{todayQuote.text}</p>
            <p className="text-white/80 text-sm font-medium">- {todayQuote.author}</p>
          </div>
        )}

        {/* 오늘의 미션 - Modern Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-neutral-200/50 border border-neutral-100/50 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">오늘의 미션</h3>
            <button
              onClick={() => router.push('/mission')}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold touch-manipulation px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              aria-label="미션 수정"
            >
              수정하기
            </button>
          </div>
          {missions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-neutral-600 text-base mb-1 font-medium">아직 미션이 없어요</p>
              <p className="text-sm text-neutral-400">첫 미션을 추가해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.slice(0, 3).map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 transition-all group"
                >
                  <button
                    onClick={() => toggleMission(mission.id, mission.completed)}
                    className={`flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all touch-manipulation ${
                      mission.completed
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-transparent shadow-md'
                        : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                    aria-label={mission.completed ? '미션 완료 취소' : '미션 완료'}
                  >
                    {mission.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 text-base ${mission.completed ? 'line-through text-neutral-400' : 'text-neutral-700 font-medium'}`}>
                    {mission.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push('/mission')}
            className="mt-4 w-full text-primary-600 text-base font-semibold hover:text-primary-700 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-primary-50 transition-all touch-manipulation group"
            aria-label="미션 상세 페이지로 이동"
          >
            미션 상세보기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 한 줄 일기 - Enhanced Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-neutral-200/50 border border-neutral-100/50 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">한 줄 일기</h3>
            <button
              onClick={() => router.push('/diary')}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 touch-manipulation px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-all group"
              aria-label="일기 전체보기"
            >
              전체보기
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 일기 기분 선택 */}
          <div className="mb-5">
            <p className="text-sm text-neutral-600 font-medium mb-3">오늘의 기분</p>
            <div className="flex gap-2 justify-center">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setDiaryEmotion(emotion.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all touch-manipulation min-w-[52px] ${
                    diaryEmotion === emotion.value
                      ? 'bg-gradient-to-br from-primary-100 to-secondary-100 border-2 border-primary-400 shadow-md scale-110'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-2 border-transparent hover:scale-105'
                  }`}
                  aria-label={emotion.label}
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요..."
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none text-base placeholder-neutral-400 transition-all"
            rows={3}
            aria-label="일기 내용 입력"
          />
          <button
            onClick={handleSaveDiary}
            disabled={!diary.trim() || !diaryEmotion || saving}
            className="mt-4 w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3.5 rounded-2xl font-semibold hover:from-primary-600 hover:to-secondary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation text-base shadow-lg shadow-primary-500/30"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* AI 코치 바로가기 - Gradient CTA */}
        <button
          onClick={() => router.push('/coach')}
          className="group relative w-full bg-gradient-to-br from-accent-500 via-accent-600 to-primary-600 text-white rounded-3xl p-6 shadow-xl shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all touch-manipulation overflow-hidden"
          aria-label="AI 코치 페이지로 이동"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative flex items-center justify-between">
            <div className="text-left flex-1 min-w-0 pr-4">
              <h3 className="font-bold text-lg mb-1.5 tracking-tight">AI 코치와 대화하기</h3>
              <p className="text-white/90 text-base font-medium">고민이 있으신가요? 편지를 써보세요</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl flex-shrink-0 group-hover:bg-white/30 group-hover:scale-110 transition-all">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
