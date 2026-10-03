'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, Circle } from 'lucide-react';
import { mockKitchenChecklist } from '../data';
import KitchenCapacityCard from './KitchenCapacityCard';

interface AIOperationsSummaryProps {
  onOpenAIModal: () => void;
  onOpenReportModal: () => void;
}

export default function AIOperationsSummarySection({
  onOpenAIModal,
  onOpenReportModal,
}: AIOperationsSummaryProps) {
  const [checklist, setChecklist] = useState(mockKitchenChecklist);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: AI Operations Summary & Checklist (8 cols) */}
      <div className="lg:col-span-8 p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl">
        <div>
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-bold text-white font-['Inter']">
                  Tavonza AI Operations Summary
                </div>
                <div className="text-xs text-zinc-400 font-medium font-['Inter']">
                  Real-time kitchen load analysis & dispatch cues
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Optimal 93%
            </span>
          </div>

          {/* AI Narrative */}
          <p className="mt-3.5 text-sm text-zinc-300 font-normal font-['Inter'] leading-relaxed">
            Kitchen operations are running at <strong className="text-white">93% efficiency</strong>. Four high-priority orders should be completed within the next 10 minutes. <span className="text-amber-400 font-medium">Grill Station</span> is approaching maximum capacity, while <span className="text-emerald-400 font-medium">Fry Station</span> has available capacity. Reassigning two burger orders will improve kitchen flow and reduce customer wait times.
          </p>

          {/* Action Checklist Grid */}
          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  item.completed
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 line-through opacity-70'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-white/5'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
                <span className="text-sm font-normal font-['Inter']">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAIModal}
            className="h-8 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg flex items-center gap-1.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Tavonza AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="h-8 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 text-sm font-medium transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>View AI Report</span>
          </button>
        </div>
      </div>

      {/* Right: Kitchen Capacity Radial Card (4 cols) */}
      <div className="lg:col-span-4">
        <KitchenCapacityCard />
      </div>
    </div>
  );
}
