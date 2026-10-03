'use client';

import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { GuestReview } from '../types';

export interface GuestExperienceSectionProps {
  rating?: number;
  reviews: GuestReview[];
  insightText?: string;
}

export default function GuestExperienceSection({
  rating = 4.9,
  reviews,
  insightText = 'Guests served within 15 minutes are significantly more likely to leave a 5-star review and return within 30 days.',
}: GuestExperienceSectionProps) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-white/10">
          <h3 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
            Guest Experience
          </h3>
          <p className="text-zinc-400 text-sm font-normal font-['Inter'] mt-0.5">
            Customer Feedback
          </p>
        </div>

        {/* Rating Score */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-amber-400 text-3xl font-bold font-['JetBrains_Mono'] leading-none">
            {rating}
          </div>
          <div className="text-slate-400 text-sm font-normal font-['Plus_Jakarta_Sans']">
            / 5
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-3 mt-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between"
            >
              <div className="text-slate-200 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed">
                {rev.comment}
              </div>
              <div className="flex items-center justify-between mt-2 pt-1">
                <span className="text-slate-400 text-xs font-normal font-['Plus_Jakarta_Sans']">
                  — {rev.guestName}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Pill Box */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider font-['DM_Sans']">
            AI Insight
          </span>
        </div>
        <p className="text-slate-200/90 text-sm font-normal font-['DM_Sans'] leading-relaxed">
          {insightText}
        </p>
      </div>
    </div>
  );
}
