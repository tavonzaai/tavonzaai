'use client';

import React from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Home, FileSearch, FileText, User } from 'lucide-react';

export type DashboardTab = 'menu' | 'home' | 'search' | 'jarvis' | 'orders' | 'profile';

interface BottomNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isVisible?: boolean;
}

export default function BottomNav({ activeTab, onTabChange, isVisible = true }: BottomNavProps) {
  const isMenuActive = activeTab === 'menu' || activeTab === 'home';

  return (
    <div
      className={`w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto fixed -bottom-1 left-0 right-0 bg-black/85 backdrop-blur-xl border-t border-white/10 rounded-t-[14px] shadow-[0px_-10px_25px_rgba(0,0,0,0.8)] z-50 overflow-hidden font-sans transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="w-full h-20 px-2 pt-2 pb-1 flex items-center justify-around relative">
        {/* Active Ambient Blur Background Glow */}
        <div className="w-80 h-9 left-1/2 -translate-x-1/2 top-[-26px] absolute bg-zinc-800/80 rounded-full blur-xl pointer-events-none" />

        {/* 1. Menu Tab */}
        <button
          onClick={() => onTabChange('menu')}
          className="flex flex-col items-center justify-center w-14 h-14 relative group transition active:scale-95"
        >
          {isMenuActive && (
            <div className="absolute top-1 w-7 h-7 bg-yellow-400/20 rounded-full blur-[10px] -z-10" />
          )}
          <UtensilsCrossed
            className={`w-5 h-5 transition-all ${
              isMenuActive
                ? 'text-yellow-400 stroke-[2] scale-110'
                : 'text-white/70 group-hover:text-white stroke-[1.75]'
            }`}
          />
          <span
            className={`text-[10px] font-medium font-['Inter'] mt-1 transition-colors ${
              isMenuActive
                ? 'text-yellow-400 underline underline-offset-2 font-semibold'
                : 'text-violet-100/60'
            }`}
          >
            Menu
          </span>
        </button>

        {/* 2. Search Tab */}
        <button
          onClick={() => onTabChange('search')}
          className="flex flex-col items-center justify-center w-14 h-14 relative group transition active:scale-95"
        >
          {activeTab === 'search' && (
            <div className="absolute top-1 w-7 h-7 bg-yellow-400/20 rounded-full blur-[10px] -z-10" />
          )}
          <FileSearch
            className={`w-5 h-5 transition-all ${
              activeTab === 'search'
                ? 'text-yellow-400 stroke-[2] scale-110'
                : 'text-white/70 group-hover:text-white stroke-[1.75]'
            }`}
          />
          <span
            className={`text-[10px] font-medium font-['Inter'] mt-1 transition-colors ${
              activeTab === 'search'
                ? 'text-yellow-400 underline underline-offset-2 font-semibold'
                : 'text-violet-100/60'
            }`}
          >
            Search
          </span>
        </button>

        {/* 3. Center Elevated JARVIS Bot Tab */}
        <button
          onClick={() => onTabChange('jarvis')}
          className="flex flex-col items-center justify-center w-14 h-16 -mt-4 relative group transition active:scale-95"
        >
          {activeTab === 'jarvis' && (
            <div className="absolute top-0 w-9 h-9 bg-yellow-400/30 rounded-full blur-[12px] -z-10" />
          )}
          <div
            className={`w-11 h-11 rounded-full bg-neutral-900 border-2 flex items-center justify-center shadow-lg transition-all ${
              activeTab === 'jarvis'
                ? 'border-yellow-400 shadow-yellow-500/30 scale-105 bg-neutral-800'
                : 'border-neutral-500 hover:border-neutral-400'
            }`}
          >
            <Image
              src="/images/image 11.png"
              alt="JARVIS"
              width={28}
              height={28}
              className={`object-contain transition-transform ${
                activeTab === 'jarvis' ? 'scale-110' : 'opacity-85'
              }`}
            />
          </div>
          <span
            className={`text-[10px] font-medium font-['Inter'] mt-0.5 transition-colors ${
              activeTab === 'jarvis'
                ? 'text-yellow-400 underline underline-offset-2 font-semibold'
                : 'text-violet-100/60'
            }`}
          >
            JARVIS
          </span>
        </button>

        {/* 4. Orders Tab */}
        <button
          onClick={() => onTabChange('orders')}
          className="flex flex-col items-center justify-center w-14 h-14 relative group transition active:scale-95"
        >
          {activeTab === 'orders' && (
            <div className="absolute top-1 w-7 h-7 bg-yellow-400/20 rounded-full blur-[10px] -z-10" />
          )}
          <FileText
            className={`w-5 h-5 transition-all ${
              activeTab === 'orders'
                ? 'text-yellow-400 stroke-[2] scale-110'
                : 'text-white/70 group-hover:text-white stroke-[1.75]'
            }`}
          />
          <span
            className={`text-[10px] font-medium font-['Inter'] mt-1 transition-colors ${
              activeTab === 'orders'
                ? 'text-yellow-400 underline underline-offset-2 font-semibold'
                : 'text-violet-100/60'
            }`}
          >
            Orders
          </span>
        </button>

        {/* 5. Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center justify-center w-14 h-14 relative group transition active:scale-95"
        >
          {activeTab === 'profile' && (
            <div className="absolute top-1 w-7 h-7 bg-yellow-400/20 rounded-full blur-[10px] -z-10" />
          )}
          <User
            className={`w-5 h-5 transition-all ${
              activeTab === 'profile'
                ? 'text-yellow-400 stroke-[2] scale-110'
                : 'text-white/70 group-hover:text-white stroke-[1.75]'
            }`}
          />
          <span
            className={`text-[10px] font-medium font-['Inter'] mt-1 transition-colors ${
              activeTab === 'profile'
                ? 'text-yellow-400 underline underline-offset-2 font-semibold'
                : 'text-violet-100/60'
            }`}
          >
            Profile
          </span>
        </button>
      </div>

      {/* Bottom Home Indicator Bar (w-16 h-0.5 bg-stone-300 rounded-[38px]) */}
      <div className="w-16 h-0.5 mx-auto mb-1.5 bg-stone-300 rounded-[38px] opacity-80" />
    </div>
  );
}


