'use client';

import React from 'react';

export default function CheckoutQueueSection() {
  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
            Checkout Queue
          </h2>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4 mt-1">
            Live Queue
          </p>
        </div>

        {/* 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Waiting */}
          <div className="h-20 px-2 py-3.5 bg-white/5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col items-center justify-center">
            <div className="text-orange-500 text-3xl font-bold font-['Inter'] leading-tight">
              06
            </div>
            <div className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Waiting
            </div>
          </div>

          {/* Avg Wait */}
          <div className="h-20 px-2 py-3.5 bg-white/5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col items-center justify-center">
            <div className="text-emerald-500 text-3xl font-bold font-['Inter'] leading-tight">
              02 min
            </div>
            <div className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Avg Wait
            </div>
          </div>
        </div>

        {/* Counter Info Rows */}
        <div className="space-y-3 text-sm border-t border-white/5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-normal font-['Inter']">Active Counters</span>
            <span className="text-white font-medium font-['Inter']">Counter 01 & 02</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-normal font-['Inter']">Queue Status</span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-medium font-['Inter']">Operating Smoothly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
