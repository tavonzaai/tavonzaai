'use client';

import React from 'react';
import { Calendar, MessageSquareText } from 'lucide-react';

interface ReviewsHeaderProps {
  dateRangeText?: string;
}

export default function ReviewsHeader({
  dateRangeText = 'MAY 2025 - JULY 2026',
}: ReviewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight">
            Customer Reviews
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <MessageSquareText className="w-3 h-3 text-emerald-400" />
            Live Sync
          </span>
        </div>
        <p className="text-slate-400 text-base sm:text-lg font-normal">
          Monitor guest feedback and respond to maintain your reputation.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3.5 py-2 bg-neutral-800/90 border border-zinc-700/60 rounded-lg text-white text-sm sm:text-base font-medium flex items-center gap-2 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{dateRangeText}</span>
        </div>
      </div>
    </div>
  );
}
