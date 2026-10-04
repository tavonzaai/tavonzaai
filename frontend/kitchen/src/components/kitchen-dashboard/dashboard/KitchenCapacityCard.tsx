'use client';

import React from 'react';
import { Gauge, Flame, Users, Clock, Layers } from 'lucide-react';

export default function KitchenCapacityCard() {
  const percentage = 82;
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;

  return (
    <div className="h-full p-6 bg-neutral-900/90 rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-base font-medium text-slate-200 font-['Inter']">Kitchen Capacity</span>
        </div>
        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
          Heavy Load
        </span>
      </div>

      {/* Circular Progress Gauge */}
      <div className="my-3 flex items-center justify-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/10"
              fill="transparent"
            />
            {/* Active Value */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-orange-500 transition-all duration-1000 ease-out"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white font-mono tracking-tight">{percentage}%</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Load</span>
          </div>
        </div>
      </div>

      {/* Metrics Row List */}
      <div className="space-y-2 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Current Load</span>
          </div>
          <span className="font-bold text-amber-500 font-mono">82%</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Chefs</span>
          </div>
          <span className="font-bold text-blue-400 font-mono">6 On Shift</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-yellow-500" />
            <span>Queue</span>
          </div>
          <span className="font-bold text-yellow-500 font-mono">24 Tickets</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avg Wait</span>
          </div>
          <span className="font-bold text-emerald-500 font-mono">13 min</span>
        </div>
      </div>
    </div>
  );
}
