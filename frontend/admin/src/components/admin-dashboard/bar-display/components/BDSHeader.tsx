'use client';

import React from 'react';
import { RotateCcw, Radio } from 'lucide-react';
import { BarOrder } from '../types';

export interface BDSHeaderProps {
  orders: BarOrder[];
  onResetDemo: () => void;
}

export default function BDSHeader({ orders, onResetDemo }: BDSHeaderProps) {
  const activeCount = orders.filter((o) => o.status !== 'Ready').length;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Bar Display System
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Live Drink Queue
        </p>
      </div>

      {/* Right Controls & Status Badges */}
      <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
        {/* Active Orders Pill */}
        <div className="h-9 px-3.5 py-1.5 bg-green-700/10 rounded-lg border border-green-600/30 inline-flex items-center gap-2">
          <span className="size-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-base font-medium font-['Inter']">
            {activeCount} active orders
          </span>
        </div>

        {/* Reset / Refresh Button */}
        <button
          type="button"
          onClick={onResetDemo}
          className="h-9 px-3.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 backdrop-blur-[10.20px] text-white text-base font-normal font-['Inter'] flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/80" />
          <span>Reset</span>
        </button>

        {/* LIVE Indicator Badge */}
        <div className="h-9 px-3.5 bg-neutral-400/10 rounded-lg border border-gray-400/30 text-white text-base font-medium font-['Inter'] flex items-center gap-2">
          <span className="size-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-ping" />
          <span className="tracking-wider text-sm font-bold text-white">LIVE</span>
        </div>
      </div>
    </div>
  );
}
