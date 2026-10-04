'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MarketplaceHeroBannerProps {
  onBrowseAll: () => void;
}

export default function MarketplaceHeroBanner({
  onBrowseAll,
}: MarketplaceHeroBannerProps) {
  return (
    <div className="w-full p-6 sm:p-7 bg-white/10 rounded-2xl outline outline-1 outline-white/20 backdrop-blur-[30px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/15 transition-all" />

      <div className="space-y-1.5 max-w-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h2 className="text-white text-lg sm:text-xl font-bold font-['Plus_Jakarta_Sans'] leading-6">
            Connect your entire restaurant stack
          </h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base font-normal font-['Inter'] leading-5">
          50+ integrations to streamline operations, boost revenue, and delight customers.
        </p>
      </div>

      <button
        type="button"
        onClick={onBrowseAll}
        className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-[5px] text-sm sm:text-base inline-flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-95 shadow-lg shadow-yellow-500/20 flex-shrink-0"
      >
        <span>Browse All</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
