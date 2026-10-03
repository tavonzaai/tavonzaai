'use client';

import React from 'react';

export default function CashierGreeting() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-['Inter']">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold font-['Inter'] leading-tight tracking-tight">
          Good Morning, Emily
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm md:text-base font-normal font-['Inter'] mt-1">
          Welcome back! Here is your checkout overview for today.
        </p>
      </div>

      {/* Running Smoothly Status Pill */}
      <div className="self-start lg:self-auto px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md flex flex-wrap items-center gap-2 sm:gap-3.5 shadow-sm">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-teal-500 text-xs sm:text-sm font-semibold font-['Inter'] leading-4">
            Running Smoothly
          </span>
        </div>

        <div className="w-px h-3.5 bg-white/30" />

        {/* Metric 1 */}
        <div className="inline-flex items-center gap-1 text-sm font-['Inter'] leading-4">
          <span className="text-slate-200 font-medium">46s</span>
          <span className="text-gray-400 font-normal">avg checkout</span>
        </div>

        <div className="w-px h-3.5 bg-white/30" />

        {/* Metric 2 */}
        <div className="inline-flex items-center gap-1 text-sm font-['Inter'] leading-4">
          <span className="text-gray-400 font-normal">Goal:</span>
          <span className="text-slate-200 font-medium">60s</span>
        </div>
      </div>
    </div>
  );
}
