'use client';

import React from 'react';
import { Sparkles, TrendingUp, Award, CheckCircle2, Star } from 'lucide-react';

export default function KitchenPerformanceSection() {
  const metrics = [
    { label: 'Culinary Accuracy', value: '99.2%', sub: 'Zero returned tickets', color: 'text-emerald-400' },
    { label: 'On-Time Fulfillment', value: '96.8%', sub: '< 15 min SLA goal', color: 'text-blue-400' },
    { label: 'Avg Ticket Speed', value: '11.4 min', sub: '-2.1m vs benchmark', color: 'text-amber-400' },
    { label: 'Guest Taste Rating', value: '4.92 ★', sub: '98 reviews logged', color: 'text-amber-300' },
  ];

  return (
    <div className="h-full p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="text-base font-semibold text-white font-['Plus_Jakarta_Sans']">
            Today&apos;s Kitchen Performance
          </div>
          <span className="text-sm font-mono font-bold text-emerald-400">
            Shift #2 Active
          </span>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="p-3.5 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex flex-col justify-between"
            >
              <div className="text-sm text-zinc-400 font-normal font-['Outfit']">{m.label}</div>
              <div className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${m.color}`}>
                {m.value}
              </div>
              <div className="text-xs text-zinc-500 font-normal mt-0.5 font-['Inter']">
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Performance Banner */}
      <div className="mt-4 p-3.5 bg-amber-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-amber-500/20 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-sm text-zinc-300 font-normal font-['Outfit'] leading-relaxed">
          Serving appetizers within <strong className="text-white">5 minutes</strong> has increased overall customer satisfaction by <span className="text-amber-400 font-bold font-mono">+14%</span> today.
        </p>
      </div>
    </div>
  );
}
