'use client';

import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

export default function WelcomeKitchenHeader() {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight font-['Inter'] leading-tight">
          Good Morning, Chef Michael
        </h1>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Kitchen Active
        </span>
      </div>
      <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-normal font-['Inter']">
        Welcome back! Tavonza AI has analyzed today&apos;s kitchen operations and prepared your cooking priorities.
      </p>
    </div>
  );
}
