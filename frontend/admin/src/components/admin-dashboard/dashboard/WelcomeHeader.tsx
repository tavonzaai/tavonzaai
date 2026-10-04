'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface WelcomeHeaderProps {
  onOpenAIReport?: () => void;
}

export default function WelcomeHeader({ onOpenAIReport }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight sm:leading-9 font-sans">
          Welcome back, John
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-normal text-zinc-400 mt-1 leading-normal sm:leading-6 font-sans">
          Here's your AI-powered business overview for today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Glassmorphic Live Update Badge */}
        <div className="px-4 py-2 bg-white/5 rounded-[10px] border border-white/20 backdrop-blur-[10.20px] inline-flex items-center gap-1.5 text-white text-sm font-semibold font-sans shadow-sm">
          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '6s' }} />
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
}

