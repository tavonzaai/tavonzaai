'use client';

import React from 'react';
import { BIActionPlanItem } from '../types';

export interface StrategicActionPlanCardProps {
  items: BIActionPlanItem[];
}

export default function StrategicActionPlanCard({
  items,
}: StrategicActionPlanCardProps) {
  const getStatusBadge = (status: BIActionPlanItem['status']) => {
    switch (status) {
      case 'Recommended':
        return (
          <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20 whitespace-nowrap">
            Recommended
          </span>
        );
      case 'Urgent':
        return (
          <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20 whitespace-nowrap">
            Urgent
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-300 text-xs font-semibold rounded-full border border-slate-500/20 whitespace-nowrap">
            Pending
          </span>
        );
      case 'Analysis':
        return (
          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-300 text-xs font-semibold rounded-full border border-slate-500/20 whitespace-nowrap">
            Analysis
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 md:p-7 shadow-2xl space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Strategic Action Plan
        </h3>
        <p className="text-slate-400 text-sm font-normal font-['Inter'] mt-1">
          Prioritized AI recommendations to maximize revenue and operational efficiency.
        </p>
      </div>

      {/* List of Actions */}
      <div className="space-y-2.5 pt-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/60 rounded-[8px] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-['Inter']"
          >
            {/* Priority & Description */}
            <div className="flex items-center gap-3.5 flex-1">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg shrink-0">
                {item.priority}
              </span>
              <span className="text-white text-sm font-normal leading-5">
                {item.action}
              </span>
            </div>

            {/* Impact, Effort, Status */}
            <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
              <span className="text-green-400 text-sm font-semibold">
                {item.impact}
              </span>
              <span className="text-zinc-400 text-xs font-normal">
                {item.effort}
              </span>
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
