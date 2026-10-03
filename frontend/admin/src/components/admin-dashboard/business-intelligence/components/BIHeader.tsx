'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function BIHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Business Intelligence
        </h1>
        <p className="text-slate-400 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          AI-powered insights and predictive analytics for strategic decisions.
        </p>
      </div>

      {/* AI Powered Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-[5px] border border-white/30 backdrop-blur-lg self-start sm:self-auto transition-all shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
        <span className="text-white text-sm font-semibold font-['Inter'] leading-4">
          AI Powered
        </span>
      </div>
    </div>
  );
}
