'use client';

import { useState } from 'react';
import { Lightbulb, Newspaper, Music, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockContents } from '@/lib/mockData';

export default function ContentPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mockContents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mockContents.length - 1 ? 0 : prev + 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-8 h-8" />;
      case 'newsletter':
        return <Newspaper className="w-8 h-8" />;
      case 'music':
        return <Music className="w-8 h-8" />;
      case 'sns':
        return <Share2 className="w-8 h-8" />;
      default:
        return <Lightbulb className="w-8 h-8" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'from-accent-400 to-accent-500';
      case 'newsletter':
        return 'from-primary-400 to-primary-500';
      case 'music':
        return 'from-secondary-400 to-secondary-500';
      case 'sns':
        return 'from-primary-500 to-primary-600';
      default:
        return 'from-neutral-500 to-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Modern Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white px-6 pt-safe pt-10 pb-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">콘텐츠</h1>
          <p className="text-white/80 text-base font-medium">마음을 채우는 순간들</p>
        </div>
      </div>

      {/* Floating Filter Chips */}
      <div className="px-6 -mt-8 relative z-20 mb-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl shadow-primary-500/10 border border-white/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold whitespace-nowrap shadow-lg shadow-primary-500/30 scale-105">
              전체
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-white text-neutral-600 text-sm font-semibold whitespace-nowrap hover:bg-neutral-50 hover:scale-105 transition-all touch-manipulation shadow-md">
              명상
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-white text-neutral-600 text-sm font-semibold whitespace-nowrap hover:bg-neutral-50 hover:scale-105 transition-all touch-manipulation shadow-md">
              운동
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-white text-neutral-600 text-sm font-semibold whitespace-nowrap hover:bg-neutral-50 hover:scale-105 transition-all touch-manipulation shadow-md">
              글귀
            </button>
            <button className="px-5 py-2.5 rounded-2xl bg-white text-neutral-600 text-sm font-semibold whitespace-nowrap hover:bg-neutral-50 hover:scale-105 transition-all touch-manipulation shadow-md">
              영상
            </button>
          </div>
        </div>
      </div>

      {/* Main Carousel */}
      <div className="px-4 py-6">
        <div className="relative">
          <div className={`bg-gradient-to-br ${getColor(mockContents[activeIndex].type)} rounded-2xl p-6 sm:p-8 text-white shadow-xl min-h-[320px] sm:min-h-[400px] flex flex-col justify-between`}>
            <div className="px-8 sm:px-12">
              <div className="mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14">
                  {getIcon(mockContents[activeIndex].type)}
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">
                {mockContents[activeIndex].title}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed opacity-90">
                {mockContents[activeIndex].content}
              </p>
            </div>

            {mockContents[activeIndex].link && (
              <div className="px-8 sm:px-12">
                <a
                  href={mockContents[activeIndex].link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium hover:bg-white/30 active:bg-white/40 transition-colors mt-4 sm:mt-6 w-full sm:w-fit text-sm sm:text-base"
                >
                  자세히 보기
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg active:scale-95 transition-all z-10"
            aria-label="이전 콘텐츠"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg active:scale-95 transition-all z-10"
            aria-label="다음 콘텐츠"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {mockContents.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all touch-manipulation ${
                index === activeIndex ? 'w-8 bg-primary-600' : 'w-2 bg-neutral-300'
              }`}
              aria-label={`콘텐츠 ${index + 1}번으로 이동`}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <div className="px-6 pb-8">
        <h3 className="font-semibold text-neutral-900 mb-3 text-base sm:text-lg">빠른 탐색</h3>
        <div className="grid grid-cols-2 gap-3">
          {mockContents.slice(0, 4).map((content, index) => (
            <button
              key={content.id}
              onClick={() => setActiveIndex(index)}
              className={`bg-white rounded-xl p-3.5 sm:p-4 shadow-sm active:shadow-lg transition-all text-left touch-manipulation ${
                index === activeIndex ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getColor(content.type)} rounded-full flex items-center justify-center text-white mb-2`}>
                <div className="scale-75 sm:scale-100">
                  {getIcon(content.type)}
                </div>
              </div>
              <h4 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 leading-tight">
                {content.title}
              </h4>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
