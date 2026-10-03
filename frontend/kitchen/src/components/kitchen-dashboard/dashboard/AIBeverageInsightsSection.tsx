'use client';

import React from 'react';
import { Sparkles, ArrowRight, Zap, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { mockAIInsights } from '../data';

interface AIBeverageInsightsSectionProps {
  onOpenAIModal?: () => void;
}

const getInsightIcon = (tag: string) => {
  switch (tag) {
    case 'Flow':
      return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    case 'Urgent':
      return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'Forecast':
      return <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />;
    case 'Stock':
      return <Package className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
  }
};

export default function AIBeverageInsightsSection({ onOpenAIModal }: AIBeverageInsightsSectionProps) {
  return (
    <div className="h-full p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white font-['Inter']">AI Kitchen Insights</h3>
            <p className="text-sm text-zinc-400 font-normal">Real-time throughput & stock predictions</p>
          </div>
          <button
            type="button"
            onClick={onOpenAIModal}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 text-sm font-medium font-['DM_Sans'] transition-all cursor-pointer"
          >
            <span>View AI Insights</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Insight Cards */}
        <div className="mt-4 space-y-2.5">
          {mockAIInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 backdrop-blur-md transition-all"
            >
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.tag)}
                <span className="text-sm font-medium text-white font-['Inter']">{insight.title}</span>
                <span className="ml-auto text-[10px] font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                  {insight.tag}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400 font-normal font-['Inter'] leading-relaxed pl-5">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
