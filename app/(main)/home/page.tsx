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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
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
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Clean Professional Header */}
      <div className="bg-primary-600 text-white px-6 pt-safe pt-8 pb-24">
        {/* Profile Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Simple Avatar */}
          <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {userProfile?.displayName?.charAt(0) || '😊'}
            </span>
          </div>

          {/* Greeting */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white/80 text-sm mb-1">{getGreeting()}</p>
            <h1 className="text-xl font-bold truncate">{userProfile?.displayName}님</h1>
            <p className="text-white/60 text-xs mt-1">
              {format(new Date(), 'M월 d일 EEEE', { locale: ko })}
            </p>
          </div>
        </div>

        {/* Clean Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-xs text-white/80">연속 출석</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {userProfile?.streak || 0}일
            </div>
          </div>

          {/* Mission Completion Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-accent-300" />
              <span className="text-xs text-white/80">완료율</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {completionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Simple Attendance Card */}
      <div className="px-6 -mt-12 relative z-20">
        <button
          onClick={() => router.push('/attendance')}
          className="bg-white rounded-2xl p-5 w-full text-left shadow-md border border-neutral-200 hover:shadow-lg transition-shadow touch-manipulation"
          aria-label="출석 현황 페이지로 이동"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 text-base">오늘의 출석 체크</h3>
            <span className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-lg font-medium">
              {format(new Date(), 'M/d', { locale: ko })}
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`flex-1 h-2.5 rounded-full ${
                  day <= (userProfile?.streak || 0)
                    ? 'bg-primary-500'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-600 text-center">
            {userProfile?.streak === 7 ? '🎉 7일 연속 달성!' : `${7 - (userProfile?.streak || 0)}일 남았어요`}
          </p>
        </button>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* 오늘의 명언 - Clean Card */}
        {todayQuote.text && (
          <div className="bg-primary-600 text-white rounded-2xl p-5 border border-primary-500">
            <div className="flex items-start justify-between mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <button
                onClick={handleShareQuote}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
                aria-label="명언 공유하기"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-base font-medium leading-relaxed mb-3">{todayQuote.text}</p>
            <p className="text-white/70 text-sm">- {todayQuote.author}</p>
          </div>
        )}

        {/* 오늘의 미션 - Clean Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 text-base">오늘의 미션</h3>
            <button
              onClick={() => router.push('/mission')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium touch-manipulation"
              aria-label="미션 수정"
            >
              수정
            </button>
          </div>
          {missions.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600 text-sm mb-1">아직 미션이 없어요</p>
              <p className="text-xs text-neutral-400">첫 미션을 추가해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {missions.slice(0, 3).map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <button
                    onClick={() => toggleMission(mission.id, mission.completed)}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all touch-manipulation ${
                      mission.completed
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-neutral-300 hover:border-primary-400'
                    }`}
                    aria-label={mission.completed ? '미션 완료 취소' : '미션 완료'}
                  >
                    {mission.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${mission.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                    {mission.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push('/mission')}
            className="mt-3 w-full text-primary-600 text-sm font-medium flex items-center justify-center gap-1 py-2 hover:text-primary-700 transition-colors touch-manipulation"
            aria-label="미션 상세 페이지로 이동"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 한 줄 일기 - Clean Card */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 text-base">한 줄 일기</h3>
            <button
              onClick={() => router.push('/diary')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium touch-manipulation"
              aria-label="일기 전체보기"
            >
              전체보기
            </button>
          </div>

          {/* 일기 기분 선택 */}
          <div className="mb-4">
            <p className="text-xs text-neutral-600 font-medium mb-2">오늘의 기분</p>
            <div className="flex gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setDiaryEmotion(emotion.value)}
                  className={`flex-1 p-2 rounded-lg transition-all touch-manipulation ${
                    diaryEmotion === emotion.value
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-neutral-50 border-2 border-transparent hover:bg-neutral-100'
                  }`}
                  aria-label={emotion.label}
                >
                  <span className="text-xl">{emotion.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={diary}
            onChange={(e) => setDiary(e.target.value)}
            placeholder="오늘 하루는 어땠나요?"
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm placeholder-neutral-400"
            rows={3}
            aria-label="일기 내용 입력"
          />
          <button
            onClick={handleSaveDiary}
            disabled={!diary.trim() || !diaryEmotion || saving}
            className="mt-3 w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* AI 코치 바로가기 - Clean CTA */}
        <button
          onClick={() => router.push('/coach')}
          className="w-full bg-accent-600 text-white rounded-2xl p-5 border border-accent-500 hover:bg-accent-700 transition-colors touch-manipulation"
          aria-label="AI 코치 페이지로 이동"
        >
          <div className="flex items-center justify-between">
            <div className="text-left flex-1">
              <h3 className="font-semibold text-base mb-1">AI 코치와 대화하기</h3>
              <p className="text-white/80 text-sm">고민이 있으신가요? 편지를 써보세요</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
}
