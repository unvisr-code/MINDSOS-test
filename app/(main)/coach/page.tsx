'use client';

import { useState, useEffect } from 'react';
import { Plus, Lock, Loader2, MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockLetters, mockAICoaches } from '@/lib/mockData';
import type { Letter, AICoach } from '@/types';

export default function CoachPage() {
  const router = useRouter();
  const [showNewLetter, setShowNewLetter] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<AICoach>(mockAICoaches[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = () => {
    try {
      setLoading(true);
      // Load only user's letters (both public and private)
      const data = mockLetters.filter(l => l.userId === 'mock-user-1');
      setLetters(data);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (content: string, coach: AICoach): string => {
    const responses = {
      luna: [
        `${content.slice(0, 20)}... 에 대해 이야기해주셔서 감사해요. 그런 마음이 드는 건 자연스러운 일이에요. 자신에게 조금 더 관대해지는 건 어떨까요?`,
        `힘든 상황이네요. 하지만 이렇게 이야기를 나누는 것만으로도 큰 용기예요. 당신의 감정을 충분히 인정해주세요.`,
        `충분히 공감이 갑니다. 지금 느끼는 감정들을 그대로 받아들이는 것부터 시작해보면 어떨까요?`,
      ],
      minsoo: [
        `구체적인 상황을 공유해주셔서 감사합니다. 이런 경우 단계별로 접근하는 것이 좋습니다. 먼저 가장 시급한 것부터 정리해보세요.`,
        `실용적으로 접근해봅시다. 1) 현재 상황 파악 2) 해결 가능한 것과 불가능한 것 구분 3) 실천 가능한 작은 목표 설정을 추천합니다.`,
        `좋은 질문이에요. 이런 상황에서는 감정보다는 사실에 집중하고, 할 수 있는 것부터 하나씩 실천해보는 것이 효과적입니다.`,
      ],
      haneul: [
        `와, 이렇게 용기내서 이야기해주셔서 정말 멋져요! 이미 당신은 변화를 시작했어요. 작은 진전도 큰 성장이랍니다! ✨`,
        `힘들었겠지만, 지금 이 순간에도 당신은 성장하고 있어요. 내일은 오늘보다 조금 더 나아질 거예요. 함께 파이팅해요! 💪`,
        `당신의 이야기를 들으니 마음이 뭉클해요. 이미 충분히 잘하고 있어요. 조금만 더 긍정적으로 바라봐요! 🌈`,
      ],
    };

    const coachResponses = responses[coach.id as keyof typeof responses] || responses.luna;
    return coachResponses[Math.floor(Math.random() * coachResponses.length)];
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);

      // Simulate AI response generation
      setTimeout(() => {
        const aiResponse = generateAIResponse(content, selectedCoach);

        const newLetter: Letter = {
          id: `letter-${Date.now()}`,
          userId: 'mock-user-1',
          title,
          content,
          aiResponse,
          isPrivate,
          coachId: selectedCoach.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add to letters state
        setLetters(prev => [newLetter, ...prev]);

        // Reset form
        setShowNewLetter(false);
        setTitle('');
        setContent('');
        setIsPrivate(false);
        setSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting letter:', error);
      alert('편지 전송에 실패했습니다.');
      setSubmitting(false);
    }
  };

  const handleCoachSelect = (coach: AICoach) => {
    setSelectedCoach(coach);
    setShowCoachModal(false);
  };

  const getCoachInfo = (coachId?: string) => {
    return mockAICoaches.find(c => c.id === coachId) || mockAICoaches[0];
  };

  if (showNewLetter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 safe-top">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowNewLetter(false)}
              className="text-gray-600 active:text-gray-900 px-2 py-1 touch-manipulation"
              disabled={submitting}
            >
              취소
            </button>
            <h1 className="text-base sm:text-lg font-semibold">편지 쓰기</h1>
            <button
              onClick={handleSubmit}
              disabled={!title || !content || submitting}
              className="text-lavender-600 font-semibold active:text-lavender-700 disabled:opacity-50 flex items-center gap-2 px-2 py-1 touch-manipulation"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm sm:text-base">전송 중</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">전송</span>
              )}
            </button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4 pb-safe">
          {/* AI Coach Selection */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border-2 border-gray-200">
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 block">
              AI 코치 선택
            </label>
            <button
              onClick={() => setShowCoachModal(true)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 active:bg-gray-100 transition-all touch-manipulation"
              disabled={submitting}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${selectedCoach.color} rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
                {selectedCoach.emoji}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCoach.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedCoach.personality}</p>
                <p className="text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-1">{selectedCoach.description}</p>
              </div>
              <div className="text-gray-400 text-lg">›</div>
            </button>
          </div>

          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full text-lg sm:text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-lavender-600 focus:ring-0 pb-2"
              disabled={submitting}
            />
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${selectedCoach.name}에게 하고 싶은 이야기를 자유롭게 써보세요...`}
              className="w-full h-48 sm:h-64 border-0 focus:ring-0 resize-none text-gray-700 text-sm sm:text-base"
              disabled={submitting}
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-3.5 sm:p-4">
            <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                disabled={submitting}
              />
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">비공개로 설정</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              비공개로 설정하면 다른 사용자가 볼 수 없습니다
            </p>
          </div>
        </div>

        {/* Coach Selection Modal */}
        {showCoachModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">AI 코치 선택</h3>
                <button
                  onClick={() => setShowCoachModal(false)}
                  className="p-1 active:bg-gray-100 rounded-full touch-manipulation"
                  aria-label="닫기"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                {mockAICoaches.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => handleCoachSelect(coach)}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] ${
                      selectedCoach.id === coach.id
                        ? 'border-lavender-600 bg-lavender-50'
                        : 'border-gray-200 active:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${coach.color} rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0`}>
                        {coach.emoji}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{coach.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{coach.personality}</p>
                        <p className="text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{coach.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Redirect to chat page with letter context
  useEffect(() => {
    if (selectedLetter) {
      const letterCoach = getCoachInfo(selectedLetter.coachId);
      router.push(`/coach/chat?letterId=${selectedLetter.id}&coachId=${letterCoach.id}`);
    }
  }, [selectedLetter]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Clean Professional Header */}
      <div className="bg-primary-600 text-white px-6 pt-safe pt-8 pb-6">
        <h1 className="text-xl font-bold mb-1">AI 코치</h1>
        <p className="text-white/80 text-sm">마음을 나누고 성장하는 대화</p>
      </div>

      {/* AI 코치 선택 */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-md border border-neutral-200">
          <h3 className="font-semibold text-base text-neutral-900 mb-4">당신의 마음 동반자를 선택하세요</h3>

          {/* Coach Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {mockAICoaches.map((coach) => (
              <button
                key={coach.id}
                onClick={() => router.push(`/coach/chat?coachId=${coach.id}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors touch-manipulation border border-neutral-200"
                aria-label={`${coach.name} 코치와 대화하기`}
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm border border-neutral-100">
                  {coach.emoji}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-neutral-900 block">{coach.name}</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5 line-clamp-1">{coach.personality}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-center gap-4 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
              <span>{mockAICoaches.length}명 대기중</span>
            </div>
          </div>
        </div>
      </div>

      {/* Letters List Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-base font-semibold text-neutral-900">내 편지</h2>
      </div>

      {/* Letters List */}
      <div className="px-6 py-4 space-y-3 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-600 text-sm mb-1">편지가 없습니다</p>
            <p className="text-xs text-neutral-400">첫 편지를 작성해보세요</p>
          </div>
        ) : (
          letters.map((letter) => {
            const coach = getCoachInfo(letter.coachId);
            return (
              <div
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className="bg-white rounded-xl p-4 shadow-md border border-neutral-200 hover:shadow-lg transition-shadow cursor-pointer touch-manipulation"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1 flex-1">{letter.title}</h3>
                  <span className="text-xs text-neutral-500 ml-2">
                    {letter.createdAt && new Date(letter.createdAt.toString()).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-neutral-600 text-xs mb-2 line-clamp-2">{letter.content}</p>
                {letter.aiResponse && (
                  <div className="bg-primary-50 rounded-lg p-3 mt-2 border border-primary-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-xs">
                        {coach.emoji}
                      </div>
                      <span className="text-xs font-medium text-neutral-900">{coach.name}의 답변</span>
                    </div>
                    <p className="text-xs text-neutral-700 line-clamp-2">{letter.aiResponse}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/coach/chat')}
        className="fixed bottom-20 right-6 w-14 h-14 bg-accent-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center touch-manipulation"
        aria-label="AI 코치와 대화하기"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
