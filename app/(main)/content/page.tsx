'use client';

import { useState } from 'react';
import { Lightbulb, Newspaper, Music, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockContents } from '@/lib/mockData';

const filters = ['전체', '명상', '운동', '글귀', '영상'];

export default function ContentPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('전체');

  // Filter contents based on active filter
  const filteredContents = activeFilter === '전체'
    ? mockContents
    : mockContents.filter(content => {
        // Map filter names to content types if needed
        // For now, showing all content as we don't have type info in mockData
        return true;
      });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? filteredContents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === filteredContents.length - 1 ? 0 : prev + 1));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setActiveIndex(0); // Reset to first item when filter changes
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
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Clean Professional Header */}
      <div className="bg-primary-600 text-white px-6 pt-safe pt-8 pb-6">
        <h1 className="text-xl font-bold mb-1">콘텐츠</h1>
        <p className="text-white/80 text-sm">마음을 채우는 순간들</p>
      </div>

      {/* Simple Filter Chips */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-white">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors touch-manipulation ${
                activeFilter === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              aria-label={`${filter} 필터`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Carousel */}
      <div className="px-6 py-6">
        {filteredContents.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <p className="text-neutral-600 text-sm mb-1">콘텐츠가 없습니다</p>
            <p className="text-xs text-neutral-400">다른 필터를 선택해보세요</p>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-md min-h-[300px] flex flex-col justify-between border border-primary-500">
              <div className="px-8 sm:px-12">
                <div className="mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14">
                    {getIcon(filteredContents[activeIndex].type)}
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">
                  {filteredContents[activeIndex].title}
                </h2>
                <p className="text-base sm:text-lg leading-relaxed opacity-90">
                  {filteredContents[activeIndex].content}
                </p>
              </div>

              {filteredContents[activeIndex].link && (
                <div className="px-8">
                  <a
                    href={filteredContents[activeIndex].link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-white/20 px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
                  >
                    자세히 보기
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
          </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
              aria-label="이전 콘텐츠"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
              aria-label="다음 콘텐츠"
            >
              <ChevronRight className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
        )}

        {/* Indicators */}
        {filteredContents.length > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            {filteredContents.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all touch-manipulation ${
                  index === activeIndex ? 'w-6 bg-primary-600' : 'w-1.5 bg-neutral-300'
                }`}
                aria-label={`콘텐츠 ${index + 1}번으로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
