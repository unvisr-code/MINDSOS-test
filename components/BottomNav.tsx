'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Sparkles, Users, User } from 'lucide-react';

const navItems = [
  { href: '/home', icon: Home, label: '홈' },
  { href: '/coach', icon: MessageCircle, label: 'AI 코치' },
  { href: '/content', icon: Sparkles, label: '콘텐츠' },
  { href: '/community', icon: Users, label: '커뮤니티' },
  { href: '/mypage', icon: User, label: '마이페이지' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-sm">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center h-16 sm:h-18">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-manipulation active:scale-95 ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-primary-500'
                }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] sm:text-xs mt-0.5 transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
