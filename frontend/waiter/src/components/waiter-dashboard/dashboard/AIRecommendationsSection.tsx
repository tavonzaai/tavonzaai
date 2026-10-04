'use client';

import React from 'react';
import {
  ChevronRight,
  Sparkles,
  GlassWater,
  Star,
  Cake,
} from 'lucide-react';
import { AIRecommendation } from '../types';

export interface AIRecommendationsSectionProps {
  recommendations: AIRecommendation[];
  onDetailsClick?: () => void;
  onApplyRecommendation?: (rec: AIRecommendation) => void;
}

export default function AIRecommendationsSection({
  recommendations,
  onDetailsClick,
  onApplyRecommendation,
}: AIRecommendationsSectionProps) {
  const getIcon = (type: AIRecommendation['iconType'], colorClass: string) => {
    switch (type) {
      case 'cake':
        return <Cake className={`w-4 h-4 ${colorClass}`} />;
      case 'glass':
        return <GlassWater className={`w-4 h-4 ${colorClass}`} />;
      case 'star':
        return <Star className={`w-4 h-4 ${colorClass}`} />;
      case 'sparkles':
      default:
        return <Sparkles className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-slate-200 text-lg font-semibold font-['Inter'] leading-tight">
              AI Recommendations
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] mt-0.5">
              Smart Suggestions
            </p>
          </div>

          <button
            type="button"
            onClick={onDetailsClick}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 text-slate-400 hover:text-white text-sm font-medium font-['DM_Sans'] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Suggestions List */}
        <div className="space-y-3 mt-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onApplyRecommendation?.(rec)}
              className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 rounded-xl flex items-start gap-3 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                {getIcon(rec.iconType, rec.categoryColor)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${rec.categoryColor}`}>
                    {rec.category}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">{rec.targetTable}</span>
                </div>
                <div className="text-slate-200 text-sm font-medium font-['DM_Sans'] mt-0.5 truncate">
                  {rec.title}
                </div>
                <div className="text-slate-400 text-sm font-normal font-['DM_Sans'] mt-0.5 line-clamp-1">
                  {rec.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-500 text-right">
        Powered by Sofia AI Dining Engine
      </div>
    </div>
  );
}
