'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, TrendingUp, Award, Share2, Plus, X, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/hooks';
import { getUserMissions, createMission, updateMission, deleteMission } from '@/lib/firestore';
import { mockMissions } from '@/lib/mockData';
import type { Mission } from '@/types';

const USE_MOCK_DATA = true; // Toggle for demo

export default function MissionPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [completedDays, setCompletedDays] = useState<Date[]>([]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (user) {
      loadMissions();
    }
  }, [user]);

  const loadMissions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        // Use mock data for demo
        setMissions(mockMissions);
      } else {
        // Load from Firebase
        const data = await getUserMissions(user.uid);
        setMissions(data);
      }

      // Calculate completed days (mockup - 실제로는 history 컬렉션 필요)
      const completed: Date[] = [];
      for (let i = 0; i < 10; i++) {
        if (Math.random() > 0.3) {
          completed.push(subDays(today, i));
        }
      }
      setCompletedDays(completed);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
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

  const handleAddMission = async () => {
    if (!user || !newMissionTitle.trim()) return;

    try {
      const missionId = await createMission(user.uid, {
        title: newMissionTitle,
        completed: false,
        recurring: true,
      });

      setMissions([...missions, {
        id: missionId,
        userId: user.uid,
        title: newMissionTitle,
        completed: false,
        recurring: true,
        createdAt: new Date(),
      }]);

      setNewMissionTitle('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding mission:', error);
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm('미션을 삭제하시겠습니까?')) return;

    try {
      await deleteMission(missionId);
      setMissions(missions.filter(m => m.id !== missionId));
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

  const completionRate = missions.length > 0
    ? Math.round((missions.filter(m => m.completed).length / missions.length) * 100)
    : 0;

  const streak = completedDays.length; // 간단히 완료 일수

  // 주간 데이터 (mockup)
  const weeklyData = [
    { day: '월', completion: 80 },
    { day: '화', completion: 60 },
    { day: '수', completion: 100 },
    { day: '목', completion: 75 },
    { day: '금', completion: 90 },
    { day: '토', completion: 85 },
    { day: '일', completion: completionRate },
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-2">미션 & 리포트</h1>
        <p className="text-green-100">오늘도 한 걸음씩 성장해요</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* 달성률 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm opacity-90">오늘의 달성률</span>
            </div>
            <div className="text-3xl font-bold">{completionRate}%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm opacity-90">연속 달성</span>
            </div>
            <div className="text-3xl font-bold">{streak}일</div>
          </div>
        </div>

        {/* 오늘의 미션 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">오늘의 미션</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          </div>

          {missions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              첫 미션을 추가해보세요!
            </p>
          ) : (
            <div className="space-y-3">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => toggleMission(mission.id, mission.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      mission.completed
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {mission.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 ${mission.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {mission.title}
                  </span>
                  <button
                    onClick={() => handleDeleteMission(mission.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 주간 그래프 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">주간 달성률</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 달력 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">달성 캘린더</h3>
            <span className="text-sm text-gray-600">
              {format(today, 'yyyy년 M월', { locale: ko })}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const isCompleted = completedDays.some(d => isSameDay(d, day));
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : isToday
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* 공유 버튼 */}
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg">
          <Share2 className="w-5 h-5" />
          성과 공유하기
        </button>
      </div>

      {/* Add Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 미션 추가</h3>
            <input
              type="text"
              value={newMissionTitle}
              onChange={(e) => setNewMissionTitle(e.target.value)}
              placeholder="미션 제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMissionTitle('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddMission}
                disabled={!newMissionTitle.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
