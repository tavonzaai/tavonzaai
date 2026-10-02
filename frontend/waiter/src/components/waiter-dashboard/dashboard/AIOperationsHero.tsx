'use client';

import React from 'react';
import {
  Sparkles,
  FileText,
  Clock,
  Layers,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface AIOperationsHeroProps {
  onOpenAIModal?: () => void;
  onOpenAIReport?: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export default function AIOperationsHero({
  onOpenAIModal,
  onOpenAIReport,
  onSelectOrder,
}: AIOperationsHeroProps) {
  return (
    <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Left 8 Cols: AI Operations Summary & Actions */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            {/* Header with Title and Shift Active pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-white text-base font-bold font-['Inter'] tracking-tight">
                Tavonza AI Operations Summary
              </h2>

              <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium font-['DM_Sans']">
                  Shift Active
                </span>
              </div>
            </div>

            {/* AI Briefing Message */}
            <div className="mt-3.5 text-zinc-300 text-sm sm:text-base font-normal font-['Inter'] leading-relaxed">
              Good morning, Michael. You are assigned to <strong className="text-white font-semibold">8 tables</strong> with <strong className="text-white font-semibold">14 active orders</strong>. Table 12 has been waiting longer than average and should be prioritized. Table 8 has completed the main course and is ready for a dessert recommendation.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onOpenAIModal}
              className="h-8 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg text-sm font-semibold font-['Plus_Jakarta_Sans'] inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Tavonza AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenAIReport}
              className="h-8 px-3.5 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-slate-200 rounded-lg text-sm font-medium font-['Plus_Jakarta_Sans'] inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>View AI Report</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Current Shift Mini-Widget */}
        <div className="lg:col-span-4 bg-neutral-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-2xl flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-white text-sm font-semibold font-['Inter']">Current Shift</span>
            <span className="text-slate-400 text-xs font-medium font-['DM_Sans']">Station 2</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Shift Status */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-normal font-['DM_Sans']">Shift Status</div>
                <div className="text-emerald-400 text-sm font-semibold font-['DM_Sans']">Active</div>
              </div>
            </div>

            {/* Assigned Tables */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-3 h-3 text-blue-400" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-normal font-['DM_Sans']">Assigned Tables</div>
                <div className="text-white text-sm font-semibold font-['DM_Sans']">08</div>
              </div>
            </div>

            {/* Orders in Progress */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingBag className="w-3 h-3 text-amber-400" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-normal font-['DM_Sans']">Orders in Progress</div>
                <div className="text-white text-sm font-semibold font-['DM_Sans']">14</div>
              </div>
            </div>

            {/* Next Priority */}
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-3 h-3 text-red-400" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-normal font-['DM_Sans']">Next Priority</div>
                <div className="text-white text-sm font-semibold font-['DM_Sans']">Table 12</div>
              </div>
            </div>
          </div>

          {/* Serve Order fast-action footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-white text-xs font-medium font-['Inter']">Serve Order</span>
            <button
              type="button"
              onClick={() => onSelectOrder?.('#10582')}
              className="text-amber-400 hover:text-amber-300 text-sm font-semibold font-['DM_Sans'] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>#10582 → T-12</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
