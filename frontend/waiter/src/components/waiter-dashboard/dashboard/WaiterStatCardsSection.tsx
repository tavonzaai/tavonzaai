'use client';

import React from 'react';
import { WaiterKPI } from '../types';

export interface WaiterStatCardsSectionProps {
  stats: WaiterKPI[];
}

export default function WaiterStatCardsSection({ stats }: WaiterStatCardsSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-[0px_0px_3px_0px_rgba(75,75,75,0.8)] hover:border-zinc-700 transition-all hover:scale-[1.01]"
          >
            {/* Icon Header */}
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Value & Labels */}
            <div className="mt-2.5 sm:mt-3">
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans'] ${stat.valueColor || 'text-white'} tracking-tight leading-tight truncate`}>
                {stat.value}
              </div>
              <div className="text-white text-sm font-medium font-['Plus_Jakarta_Sans'] mt-1 truncate">
                {stat.title}
              </div>
              <div className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans'] mt-0.5 truncate">
                {stat.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
