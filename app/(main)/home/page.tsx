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
    if (!authLoading && user && userProfile) {
      loadData();
    }
  }, [authLoading, user, userProfile]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        // Use mock data for demo
        setMissions(mockMissions);
        setTodayQuote(mockQuotes[0]);
        setSelectedEmotion('happy');
      } else {
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
    if (!user || !emotion) return;

    setSelectedEmotion(emotion);

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
    if (!user || !diary.trim()) return;

    try {
      setSaving(true);
      await saveDiary(user.uid, diary);
      alert('일기가 저장되었습니다!');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 pt-12 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">안녕하세요, {userProfile?.displayName}님!</h1>
            <p className="text-indigo-100 mt-1">오늘도 함께 해요 ✨</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{userProfile?.streak || 0}일</span>
          </div>
        </div>

        {/* 출석 체크 */}
        <button
          onClick={() => router.push('/attendance')}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-full text-left hover:bg-white/20 transition-colors touch-manipulation active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">오늘의 출석</h3>
            <span className="text-sm text-indigo-100">
              {format(new Date(), 'yyyy년 M월 d일', { locale: ko })}
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`flex-1 h-2 rounded-full ${
                  day <= (userProfile?.streak || 0) ? 'bg-yellow-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </button>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* 오늘의 명언 */}
        {todayQuote.text && (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <Sparkles className="w-6 h-6" />
              <div className="flex gap-2">
                <button
                  onClick={handleShareQuote}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-lg font-medium leading-relaxed mb-3">{todayQuote.text}</p>
            <p className="text-purple-100 text-sm">- {todayQuote.author}</p>
          </div>
        )}

        {/* 오늘의 미션 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">오늘의 미션</h3>
            <button
              onClick={() => router.push('/mission')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              수정하기
            </button>
          </div>
          {missions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              미션을 추가해보세요!
            </p>
          ) : (
            <div className="space-y-3">
              {missions.slice(0, 3).map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => toggleMission(mission.id, mission.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      mission.completed
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {mission.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 ${mission.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {mission.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push('/mission')}
            className="mt-4 w-full text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center justify-center gap-1"
          >
            미션 상세보기 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 한 줄 일기 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">한 줄 일기</h3>
            <button
              onClick={() => router.push('/diary')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              전체보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 일기 기분 선택 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">오늘의 기분</p>
            <div className="flex gap-2 justify-center">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setDiaryEmotion(emotion.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    diaryEmotion === emotion.value
                      ? 'bg-indigo-100 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
          />
          <button
            onClick={handleSaveDiary}
            disabled={!diary.trim() || !diaryEmotion || saving}
            className="mt-3 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>

        {/* AI 코치 바로가기 */}
        <div
          onClick={() => router.push('/coach')}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">AI 코치와 대화하기</h3>
              <p className="text-pink-100 text-sm">고민이 있으신가요? 편지를 써보세요</p>
            </div>
            <button className="bg-white text-pink-600 p-3 rounded-full hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
