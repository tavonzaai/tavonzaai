'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { mockCustomerReviews } from '../data';

export default function CustomerFeedbackSection() {
  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
            Customer Feedback
          </h2>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4 mt-1">
            Checkout Experience
          </p>
        </div>

        {/* Rating Score Banner */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" />
            ))}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-amber-500 text-3xl font-bold font-['Inter'] leading-none">
              4.9
            </span>
            <span className="text-slate-500 text-sm font-normal font-['Inter']">/ 5</span>
          </div>
        </div>

        {/* Review Snippets */}
        <div className="space-y-3">
          {mockCustomerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/5 space-y-2"
            >
              <p className="text-slate-200 text-sm font-normal font-['Inter'] leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-normal font-['Inter']">
                  — {rev.author}
                </span>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
