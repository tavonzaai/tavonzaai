'use client';

import React from 'react';
import { AIMetric } from '../types';

interface AIMetricCardsProps {
  metrics: AIMetric[];
}

export const AIMetricCards: React.FC<AIMetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="h-28 bg-neutral-900 rounded-md shadow-[0px_0px_2px_0px_rgba(125,125,125,0.4)] border border-white/5 p-5 flex flex-col justify-center transition-all hover:border-white/15"
        >
          <div
            className={`text-xl font-bold font-['JetBrains_Mono'] leading-7 ${metric.color}`}
          >
            {metric.value}
          </div>
          <div className="text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4 mt-0.5 truncate">
            {metric.label}
          </div>
          <div className="text-slate-500 text-xs font-normal font-['Plus_Jakarta_Sans'] leading-4 mt-0.5">
            {metric.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
