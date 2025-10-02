'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockAICoaches, mockLetters } from '@/lib/mockData';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCoach, setSelectedCoach] = useState(mockAICoaches[0]);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat based on letter context or new chat
  useEffect(() => {
    const letterId = searchParams.get('letterId');
    const coachId = searchParams.get('coachId');

    if (letterId && coachId) {
      // Load existing letter conversation
      const letter = mockLetters.find(l => l.id === letterId);
      const coach = mockAICoaches.find(c => c.id === coachId) || mockAICoaches[0];

      setSelectedCoach(coach);

      if (letter) {
        setMessages([
          { role: 'user', content: letter.content },
          { role: 'ai', content: letter.aiResponse || '' }
        ]);
      }
      setIsInitialized(true);
    } else if (coachId) {
      // New chat with pre-selected coach
      const coach = mockAICoaches.find(c => c.id === coachId) || mockAICoaches[0];
      setSelectedCoach(coach);
      setMessages([
        { role: 'ai', content: `안녕하세요! 저는 ${coach.name}입니다. ${coach.description} 무엇이든 편하게 이야기해주세요.` }
      ]);
      setIsInitialized(true);
    } else {
      // Show coach selection modal for new chat
      setShowCoachModal(true);
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
  }, [isInitialized, messages.length]);

  const generateCoachResponse = (userMessage: string, coach: typeof mockAICoaches[0]): string => {
    const responsesByCoach = {
      luna: [
        `${userMessage.slice(0, 30)}... 에 대해 이야기해주셔서 감사해요. 그런 마음이 드는 건 자연스러운 일이에요.`,
        `힘든 상황이네요. 하지만 이렇게 이야기를 나누는 것만으로도 큰 용기예요. 당신의 감정을 충분히 인정해주세요.`,
        `충분히 공감이 갑니다. 자신에게 조금 더 관대해지는 건 어떨까요? 지금 느끼는 감정들을 그대로 받아들여보세요.`,
        `좋은 질문이에요. 먼저 자신의 감정을 인정하는 것부터 시작해보면 좋을 것 같아요. 무엇을 느끼든 괜찮아요.`,
      ],
      minsoo: [
        `구체적으로 말씀해주셔서 감사합니다. 이런 경우 단계별로 접근하는 것이 효과적입니다.`,
        `실용적으로 생각해봅시다. 1) 현재 상황 파악 2) 실천 가능한 것 구분 3) 작은 목표 설정을 추천드립니다.`,
        `좋은 관찰이에요. 이런 상황에서는 감정보다는 사실에 집중하고, 할 수 있는 것부터 하나씩 실천해보세요.`,
        `그 문제는 이렇게 접근해볼 수 있어요. 먼저 가장 중요한 것부터 우선순위를 정해보는 건 어떨까요?`,
      ],
      haneul: [
        `와! 이렇게 용기내서 이야기해주셔서 정말 멋져요! 이미 당신은 변화를 시작했어요! ✨`,
        `힘들었겠지만, 지금 이 순간에도 당신은 성장하고 있어요. 내일은 오늘보다 조금 더 나아질 거예요! 💪`,
        `당신의 이야기를 들으니 마음이 뭉클해요. 이미 충분히 잘하고 있어요. 조금만 더 긍정적으로 바라봐요! 🌈`,
        `대단해요! 이런 고민을 할 수 있다는 것 자체가 성장의 신호랍니다. 함께 파이팅해요! 🎉`,
      ],
    };

    const responses = responsesByCoach[coach.id as keyof typeof responsesByCoach] || responsesByCoach.luna;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    setIsTyping(true);

    // Simulate AI response with coach personality
    setTimeout(() => {
      const aiResponse = generateCoachResponse(userMessage, selectedCoach);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCoachSelect = (coach: typeof mockAICoaches[0]) => {
    setSelectedCoach(coach);
    setShowCoachModal(false);
    setMessages([
      { role: 'ai', content: `안녕하세요! 저는 ${coach.name}입니다. ${coach.description} 무엇이든 편하게 이야기해주세요.` }
    ]);
    setIsInitialized(true);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-10 pt-safe">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 active:bg-gray-100 rounded-lg touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br ${selectedCoach.color} rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
              {selectedCoach.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{selectedCoach.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedCoach.personality}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCoachModal(true)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation border border-gray-300 whitespace-nowrap min-h-[44px]"
          >
            변경
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 pb-32">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2 sm:gap-3`}
            >
              {message.role === 'ai' && (
                <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${selectedCoach.color} rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0`}>
                  {selectedCoach.emoji}
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start items-start gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${selectedCoach.color} rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0`}>
                {selectedCoach.emoji}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Fixed above bottom nav */}
      <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-3 sm:px-4 py-3 sm:py-4 z-30 pb-safe">
        <div className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 sm:px-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
            style={{ fontSize: '16px' }}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 sm:px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center touch-manipulation min-w-[48px] min-h-[48px]"
            aria-label="메시지 전송"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Coach Selection Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6 p-safe">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">AI 코치 선택</h3>
              <button
                onClick={() => setShowCoachModal(false)}
                className="p-2 active:bg-gray-100 rounded-full touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                aria-label="닫기"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {mockAICoaches.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => handleCoachSelect(coach)}
                  className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] ${
                    selectedCoach.id === coach.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${coach.color} rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
                      {coach.emoji}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{coach.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{coach.personality}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{coach.description}</p>
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
