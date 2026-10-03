'use client';

import React from 'react';
import { TimeframeFilter } from '../types';

export interface FinanceHeaderProps {
  activeTimeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
}

export default function FinanceHeader({
  activeTimeframe,
  onTimeframeChange,
}: FinanceHeaderProps) {
  const timeframes: TimeframeFilter[] = ['Week', 'Month', 'Quarter', 'Year'];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Finance
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Revenue, expenses, and profitability overview.
        </p>
      </div>

      {/* Timeframe Toggle */}
      <div className="inline-flex items-center rounded-lg border border-white/20 bg-zinc-900/60 p-0.5 self-start sm:self-auto overflow-hidden">
        {timeframes.map((tf, idx) => {
          const isActive = activeTimeframe === tf;
          const isFirst = idx === 0;
          const isLast = idx === timeframes.length - 1;

          return (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`h-9 px-4 text-sm font-normal font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                isFirst ? 'rounded-l-md' : ''
              } ${isLast ? 'rounded-r-md' : ''} ${
                isActive
                  ? 'bg-yellow-500 text-white font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
}
