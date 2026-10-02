'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { LoyaltyActivity } from '../types';

export interface LoyaltyRecentActivityProps {
  activities: LoyaltyActivity[];
}

export default function LoyaltyRecentActivity({
  activities,
}: LoyaltyRecentActivityProps) {
  return (
    <div className="w-full lg:w-80 bg-neutral-900 rounded-[10px] border border-neutral-800 flex flex-col font-['Inter'] shadow-lg shrink-0">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-white text-base font-bold font-['Plus_Jakarta_Sans']">
          Recent Activity
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </div>

      {/* Activity List */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[520px]">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-3 bg-stone-950/50 hover:bg-stone-950/80 rounded-xl border border-zinc-800/80 flex items-start gap-3 transition-colors"
          >
            {/* Avatar */}
            <img
              src={act.avatar}
              alt={act.userName}
              className="size-7 rounded-full object-cover border border-white/10 shrink-0"
            />

            {/* Middle Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold leading-4 truncate">
                {act.userName}
              </div>
              <div className="text-slate-400 text-sm font-normal leading-4 truncate mt-0.5">
                {act.action}
              </div>
              <div className="text-slate-500 text-xs font-normal leading-4 mt-0.5">
                {act.timeAgo}
              </div>
            </div>

            {/* Right Points Tag */}
            <div className="shrink-0 text-right">
              {act.pointsChange !== undefined ? (
                <span
                  className={`text-sm font-bold font-mono ${
                    act.pointsChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {act.pointsChange > 0
                    ? `+${act.pointsChange}`
                    : `${act.pointsChange}`}
                </span>
              ) : act.isUpgrade ? (
                <span className="inline-flex items-center text-yellow-400 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
