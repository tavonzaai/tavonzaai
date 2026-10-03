'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Layers,
} from 'lucide-react';
import { FinancialPulseMetric } from '../types';

export interface FinancialPulseSectionProps {
  metrics: FinancialPulseMetric[];
}

export default function FinancialPulseSection({ metrics }: FinancialPulseSectionProps) {
  const cardConfigs = [
    {
      icon: DollarSign,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      badgeColor: 'text-green-500',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      badgeColor: 'text-green-500',
    },
    {
      icon: Package,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      badgeColor: 'text-green-500',
    },
    {
      icon: Users,
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500',
      badgeColor: 'text-green-500',
    },
    {
      icon: Layers,
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-500',
      badgeColor: 'text-red-500',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Section Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2">
          Financial Pulse
        </h3>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metrics.map((fin, i) => {
          const config = cardConfigs[i] || cardConfigs[0];
          const Icon = config.icon;

          return (
            <div
              key={i}
              className="w-full min-h-[128px] p-3.5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Row: Icon container + Badge */}
              <div className="self-stretch flex justify-between items-center">
                <div className={`size-7 ${config.iconBg} rounded-xl flex justify-center items-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${config.iconColor} stroke-[2.2]`} />
                </div>
                <div className="flex flex-col justify-start items-start">
                  <span className={`${config.badgeColor} text-xs font-semibold font-sans leading-4`}>
                    {fin.badge}
                  </span>
                </div>
              </div>

              {/* Value */}
              <div className="pt-2 flex flex-col justify-start items-start">
                <div className="text-white text-xl font-bold font-heading leading-6 tracking-tight">
                  {fin.value}
                </div>
              </div>

              {/* Title */}
              <div className="pt-0.5 flex flex-col justify-start items-start">
                <div className="text-neutral-400 text-xs font-normal font-sans leading-4">
                  {fin.title}
                </div>
              </div>

              {/* Period */}
              <div className="pt-0.5 flex flex-col justify-start items-start">
                <div className="text-neutral-500 text-xs font-normal font-sans leading-4">
                  {fin.period}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

