'use client';

import React from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

export interface AIDailyBriefingProps {
  onOpenAIReport: () => void;
}

export default function AIDailyBriefing({ onOpenAIReport }: AIDailyBriefingProps) {
  const alerts = [
    {
      icon: TrendingUp,
      text: 'Revenue is projected to increase 14% during dinner hours.',
      iconColor: 'text-green-500',
      bgBox: 'bg-green-500/10',
    },
    {
      icon: AlertTriangle,
      text: 'Mozzarella cheese stock will likely run out within 18 hours.',
      iconColor: 'text-amber-500',
      bgBox: 'bg-amber-500/10',
    },
    {
      icon: Flame,
      text: 'Burger sales are trending 23% higher than yesterday.',
      iconColor: 'text-red-500',
      bgBox: 'bg-red-500/10',
    },
    {
      icon: Clock,
      text: 'Kitchen prep time increased by 3 min during lunch.',
      iconColor: 'text-slate-400',
      bgBox: 'bg-slate-400/10',
    },
    {
      icon: Star,
      text: "12 happy customers haven't left a review yet.",
      iconColor: 'text-amber-500',
      bgBox: 'bg-amber-500/10',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[10px] bg-white/10 border border-white/10 backdrop-blur-[0px] p-5 sm:p-6 lg:p-7 shadow-xl">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Narrative Briefing (starts at top, button at bottom) */}
        <div className="lg:col-span-7 flex flex-col  h-full space-y-4">
          <div>
            {/* Header: Icon, Title, Date, Live Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="size-7 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white text-lg font-semibold font-sans leading-5">
                  Tavonza AI — Daily Briefing
                </h2>
                <div className="text-neutral-400 text-base font-normal font-sans leading-5">
                  Tuesday, July 15 · 10:24 AM
                </div>
              </div>
              <div className="px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20 inline-flex items-center gap-1.5 ml-1">
                <Activity className="w-3.5 h-3.5 text-green-500 stroke-[2.5]" />
                <span className="text-green-500 text-sm font-semibold font-sans leading-4">
                  Live
                </span>
              </div>
            </div>

            {/* Narrative text with color-highlighted metrics */}
            <div className="text-white text-lg font-medium font-sans leading-relaxed">
              Good morning, John. Your restaurant is performing well today with a Business Health Score of{' '}
              <span className="text-green-500 font-medium">91/100</span>. Dinner revenue is projected to increase by{' '}
              <span className="text-yellow-500 font-medium">14%</span>, but mozzarella stock may run out before tomorrow.
            </div>

            {/* AI Recommendation sentence */}
            <p className="text-neutral-400 text-lg font-normal font-sans leading-6 mt-3">
              Promoting burgers during lunch and assigning one additional waiter to Floor 2 could improve today&apos;s revenue by an estimated $340.
            </p>
          </div>

          {/* Action Button: Amber with white text */}
          <div className="pt-3">
            <button
              onClick={onOpenAIReport}
              className="w-40 h-10 py-2.5 bg-amber-400 hover:bg-amber-500 rounded-[10px] inline-flex justify-center items-center gap-1.5 transition-colors cursor-pointer shadow-md text-white text-sm font-semibold font-sans leading-5"
            >
              View Full AI Report
            </button>
          </div>
        </div>

        {/* Right Column: 5 Stacked Micro-alerts (starts at top, aligned with header) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 justify-start lg:items-end">
          {alerts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="w-full lg:max-w-[320px] px-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="pt-0.5 flex-shrink-0">
                  <div className={`size-6 ${item.bgBox} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-normal font-sans leading-4">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

