'use client';

import React from 'react';

export interface WaiterGreetingProps {
  waiterName?: string;
}

export default function WaiterGreeting({ waiterName = 'Michael' }: WaiterGreetingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white font-['Inter'] tracking-tight leading-tight">
          Good Morning, {waiterName}
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm md:text-base font-normal font-['Inter'] mt-0.5">
          Welcome back! Your shift has started.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-3.5 py-1.5 bg-gray-900/90 border border-white/10 rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,0.15)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white text-sm font-semibold font-['Inter']">
            Live · Updated just now
          </span>
        </div>
      </div>
    </div>
  );
}
