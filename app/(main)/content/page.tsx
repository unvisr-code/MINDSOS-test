'use client';

import { useState } from 'react';
import { Lightbulb, Newspaper, Music, ExternalLink, Play, Sparkles } from 'lucide-react';
import { mockContents } from '@/lib/mockData';

const filters = ['전체', '명상', '운동', '글귀', '영상', '음악'];

export default function ContentPage() {
  const [activeFilter, setActiveFilter] = useState('전체');

  // Filter contents based on active filter
  const filteredContents = activeFilter === '전체'
    ? mockContents
    : mockContents.filter(content => content.category === activeFilter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-6 h-6" />;
      case 'newsletter':
        return <Newspaper className="w-6 h-6" />;
      case 'music':
        return <Music className="w-6 h-6" />;
      case 'video':
        return <Play className="w-6 h-6" />;
      case 'guide':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Lightbulb className="w-6 h-6" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'tip':
        return 'from-accent-400 to-accent-600';
      case 'newsletter':
        return 'from-primary-400 to-primary-600';
      case 'music':
        return 'from-secondary-400 to-secondary-600';
      case 'video':
        return 'from-primary-500 to-secondary-500';
      case 'guide':
        return 'from-accent-500 to-primary-500';
      default:
        return 'from-neutral-500 to-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Modern Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white px-6 pt-safe pt-10 pb-8 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">콘텐츠</h1>
          <p className="text-white/80 text-base font-medium">마음을 채우는 순간들</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-6 py-6 border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all touch-manipulation flex-shrink-0 ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 shadow-md border border-neutral-200'
              }`}
              aria-label={`${filter} 필터`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="px-6 py-6">
        {filteredContents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center">
              <Lightbulb className="w-10 h-10 text-primary-500" />
            </div>
            <p className="text-neutral-600 text-base font-medium mb-1">콘텐츠가 없습니다</p>
            <p className="text-sm text-neutral-400">다른 필터를 선택해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredContents.map((content) => (
              <div
                key={content.id}
                className="group bg-white rounded-3xl p-6 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all border border-neutral-100/50"
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${getGradient(content.type)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    {getIcon(content.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 text-base line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {content.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <p className="text-neutral-600 text-sm line-clamp-3 leading-relaxed mb-4">
                  {content.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl">
                    {content.category}
                  </span>
                  {content.link && (
                    <a
                      href={content.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors touch-manipulation"
                    >
                      자세히
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Count Display */}
        {filteredContents.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500">
              총 <span className="font-bold text-primary-600">{filteredContents.length}</span>개의 콘텐츠
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
