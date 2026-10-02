'use client';

import React from 'react';
import {
  Star,
  Sparkles,
  Megaphone,
  ChevronRight,
  Globe,
  Truck,
} from 'lucide-react';
import {
  ReviewItem,
  MarketingCampaign,
  SupplierItem,
} from '../types';

export interface IntelligenceSectionProps {
  reviews: ReviewItem[];
  smsSent: boolean;
  onSendSMS: () => void;
  campaigns: MarketingCampaign[];
  suppliers: SupplierItem[];
}

export default function IntelligenceSection({
  reviews,
  smsSent,
  onSendSMS,
  campaigns,
  suppliers,
}: IntelligenceSectionProps) {
  const figmaReviews = [
    {
      author: 'Emma W.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
      rating: 5,
      timeAgo: '2h ago',
      content: 'Amazing food and service! The Classic Burger is absolutely perfect.',
    },
    {
      author: 'James C.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
      rating: 5,
      timeAgo: '4h ago',
      content: 'Best pasta in the city. Staff is incredibly attentive and warm.',
    },
    {
      author: 'Sophia M.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80',
      rating: 4,
      timeAgo: 'Yesterday',
      content: 'Great atmosphere and food. The wait time was a bit long.',
    },
  ];

  return (
    <section className="space-y-4 mt-8 sm:mt-12">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <h3 className="text-xs sm:text-base md:text-lg font-bold text-zinc-400 uppercase tracking-widest px-2 text-center">
          Intelligence & External Signals
        </h3>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Left Card: Google Reviews */}
        <div className="p-4 sm:p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-amber-500/10 rounded-lg flex justify-center items-center text-amber-500 shrink-0">
                <Globe className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-base sm:text-lg font-semibold font-heading leading-5">
                  Google Reviews
                </h4>
                <p className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter'] leading-4">
                  Latest customer feedback
                </p>
              </div>
            </div>

            {/* Rating Stars & Value */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-white text-sm sm:text-lg font-bold font-['Inter']">4.8</span>
              <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">/ 5</span>
            </div>
          </div>

          {/* 4 Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="py-2 px-1 bg-zinc-800/60 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-indigo-400 text-sm sm:text-base font-bold font-['Inter'] leading-4">
                1,284
              </div>
              <div className="text-zinc-400 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Total Reviews
              </div>
            </div>

            <div className="py-2 px-1 bg-zinc-800/60 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-green-500 text-sm sm:text-base font-bold font-['Inter'] leading-4">
                48
              </div>
              <div className="text-zinc-400 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                This Month
              </div>
            </div>

            <div className="py-2 px-1 bg-zinc-800/60 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-amber-500 text-sm sm:text-base font-bold font-['Inter'] leading-4">
                4.8★
              </div>
              <div className="text-zinc-400 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Avg Rating
              </div>
            </div>

            <div className="py-2 px-1 bg-zinc-800/60 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-cyan-500 text-sm sm:text-base font-bold font-['Inter'] leading-4">
                94%
              </div>
              <div className="text-zinc-400 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Response Rate
              </div>
            </div>
          </div>

          {/* 3 Customer Review Cards */}
          <div className="space-y-2.5 pt-1">
            {figmaReviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-800/40 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-slate-800 flex flex-col justify-start items-start space-y-1.5"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="size-6 rounded-full object-cover"
                    />
                    <span className="text-white text-sm font-semibold font-['Inter'] leading-4">
                      {rev.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'fill-zinc-700 text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                      {rev.timeAgo}
                    </span>
                  </div>
                </div>
                <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-4">
                  &quot;{rev.content}&quot;
                </p>
              </div>
            ))}
          </div>

          {/* AI Banner Prompt */}
          <div className="px-3 py-2.5 bg-stone-50/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-500/20 flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-3.5 text-amber-500 flex-shrink-0" />
              <div className="text-sm leading-4 truncate">
                <span className="text-amber-500 font-semibold font-['Inter']">AI: </span>
                <span className="text-amber-500 font-normal font-['Inter']">
                  12 recent visitors haven&apos;t reviewed yet. Send a follow-up SMS.
                </span>
              </div>
            </div>
            <button
              onClick={onSendSMS}
              disabled={smsSent}
              className={`px-3 py-1 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold font-['Inter'] rounded-sm flex-shrink-0 transition-colors cursor-pointer ${
                smsSent ? 'opacity-80' : ''
              }`}
            >
              {smsSent ? 'Sent ✓' : 'Send'}
            </button>
          </div>
        </div>

        {/* 2. Right Card: Marketing Performance */}
        <div className="p-5 sm:p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-yellow-500/10 rounded-lg flex justify-center items-center text-yellow-500">
                <Megaphone className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-base sm:text-lg font-semibold font-heading leading-5">
                  Marketing Performance
                </h4>
                <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-4">
                  Active campaign results
                </p>
              </div>
            </div>
            <span className="text-yellow-500 text-sm font-medium font-['Inter'] flex items-center gap-1 hover:text-yellow-400 transition-colors cursor-pointer">
              All Campaigns <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 3 Metric Chips */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-indigo-400 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                3,240
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Total Sent
              </div>
            </div>

            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-green-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                63%
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Avg Open Rate
              </div>
            </div>

            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-amber-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                $14,440
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Revenue
              </div>
            </div>
          </div>

          {/* 3 Active Campaigns */}
          <div className="space-y-2 pt-1">
            {[
              {
                name: 'Weekend Burger',
                type: 'SMS · 840 sent',
                rate: '▲ 72%',
                rateColor: 'text-green-500',
                rev: '$2,340',
              },
              {
                name: 'VIP Dinner',
                type: 'Email · 220 sent',
                rate: '▲ 68%',
                rateColor: 'text-green-500',
                rev: '$4,800',
              },
              {
                name: 'Feedback Req.',
                type: 'SMS · 380 sent',
                rate: '▼ 48%',
                rateColor: 'text-red-500',
                rev: '—',
              },
            ].map((camp, idx) => (
              <div
                key={idx}
                className="px-3 py-2.5 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-800 flex items-center justify-between gap-3"
              >
                <div className="size-7 bg-yellow-500/10 rounded-xl flex justify-center items-center flex-shrink-0 text-yellow-500">
                  <Megaphone className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-start items-start">
                  <div className="text-white text-sm font-semibold font-['Inter'] leading-4 truncate">
                    {camp.name}
                  </div>
                  <div className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">
                    {camp.type}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className={`text-xs font-bold font-['Inter'] leading-4 ${camp.rateColor}`}>
                    {camp.rate}
                  </div>
                  <div className="text-white text-sm font-semibold font-['Inter'] leading-4">
                    {camp.rev}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Wave Trend Chart */}
          <div className="pt-2 flex flex-col space-y-1.5">
            <div className="text-neutral-300 text-xs sm:text-sm font-normal font-['Inter'] leading-4">
              Open rate trend — last 6 campaigns
            </div>

            <div className="relative w-full h-24 pt-1 flex items-stretch">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-right text-stone-300 text-xs font-normal font-['Inter'] pr-2.5 select-none pb-5">
                <span>80%</span>
                <span>60%</span>
                <span>40%</span>
              </div>

              {/* Wave SVG Area */}
              <div className="relative flex-1 flex flex-col justify-between">
                {/* Horizontal Dashed Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-5">
                  <div className="w-full h-px border-t border-dashed border-slate-800/80" />
                  <div className="w-full h-px border-t border-dashed border-slate-800/80" />
                  <div className="w-full h-px border-t border-dashed border-slate-800/80" />
                </div>

                {/* SVG Curve */}
                <div className="relative w-full h-16 overflow-hidden">
                  <svg
                    viewBox="0 0 480 64"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="marketingWaveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EAB308" stopOpacity="0.65" />
                        <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area Fill */}
                    <path
                      d="M 0,42 C 60,38 120,40 180,44 C 240,48 300,32 360,14 C 420,10 450,16 480,22 L 480,64 L 0,64 Z"
                      fill="url(#marketingWaveGrad)"
                    />
                    {/* Golden Line */}
                    <path
                      d="M 0,42 C 60,38 120,40 180,44 C 240,48 300,32 360,14 C 420,10 450,16 480,22"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between text-center text-stone-300 text-xs font-normal font-['Inter'] px-2">
                  {['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => (
                    <span key={i} className="w-4">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-location Overview & Supply Chain Section below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Card: Google Reviews (Supplier & Customer Pulse) */}
        <div className="p-5 sm:p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-amber-500/10 rounded-lg flex justify-center items-center text-amber-500">
                <Globe className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-white text-base sm:text-lg font-semibold font-heading leading-5">
                  Google Reviews
                </h4>
                <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
                  Latest customer feedback
                </p>
              </div>
            </div>

            {/* Rating Stars & Value */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-white text-base sm:text-lg font-bold font-['Inter']">4.8</span>
              <span className="text-neutral-400 text-sm font-normal font-['Inter']">/ 5</span>
            </div>
          </div>

          {/* 3 Metric Chips */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-green-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                5 / 6
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Active Suppliers
              </div>
            </div>

            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-amber-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                3
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Pending Invoices
              </div>
            </div>

            <div className="py-2.5 px-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-indigo-400 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                Tomorrow
              </div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                Next Delivery
              </div>
            </div>
          </div>

          {/* 3 Customer Review Cards */}
          <div className="space-y-2.5 pt-1">
            {figmaReviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-800/40 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-slate-800 flex flex-col justify-start items-start space-y-1.5"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="size-6 rounded-full object-cover"
                    />
                    <span className="text-white text-sm font-semibold font-['Inter'] leading-4">
                      {rev.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'fill-zinc-700 text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                      {rev.timeAgo}
                    </span>
                  </div>
                </div>
                <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-4">
                  &quot;{rev.content}&quot;
                </p>
              </div>
            ))}
          </div>

          {/* AI Banner Prompt */}
          <div className="px-3 py-2.5 bg-stone-50/5 rounded-lg outline outline-1 outline-offset-[-1px] outline-indigo-500/20 flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-3.5 text-amber-500 flex-shrink-0" />
              <div className="text-sm leading-4 truncate">
                <span className="text-amber-500 font-semibold font-['Inter']">AI: </span>
                <span className="text-amber-500 font-normal font-['Inter']">
                  12 recent visitors haven&apos;t reviewed yet. Send a follow-up SMS.
                </span>
              </div>
            </div>
            <button
              onClick={onSendSMS}
              disabled={smsSent}
              className={`px-3 py-1 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold font-['Inter'] rounded-sm flex-shrink-0 transition-colors cursor-pointer ${
                smsSent ? 'opacity-80' : ''
              }`}
            >
              {smsSent ? 'Sent ✓' : 'Send'}
            </button>
          </div>
        </div>

        {/* Right Card: Multi-location Overview */}
        <div className="p-5 sm:p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-lg font-semibold font-heading leading-6">
                Multi-location Overview
              </h4>
              <p className="text-slate-400 text-sm font-normal font-['Inter'] mt-0.5">
                All branches — today
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-['Inter']">
              <span className="text-green-500 font-bold text-base">$33,880</span>
              <span className="text-slate-400 font-normal">Combined</span>
            </div>
          </div>

          {/* 4 Branch Cards */}
          <div className="space-y-2.5 pt-1">
            {/* 1. Downtown Branch */}
            <div className="p-3 bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-green-500/10 rounded-lg flex justify-center items-center text-green-500 flex-shrink-0">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-white text-sm sm:text-base font-semibold font-['Inter']">
                    Downtown Branch
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm font-medium font-['Inter']">
                    Excellent
                  </span>
                  <span className="text-white text-sm sm:text-base font-bold font-['Inter']">
                    $12,840
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[92%] h-full bg-green-500 rounded-full" />
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-sm text-slate-400 font-['Inter'] pt-0.5">
                <span>284 covers</span>
                <span>
                  Health:{' '}
                  <span className="text-green-500 font-semibold font-['Inter']">91/100</span>
                </span>
              </div>
            </div>

            {/* 2. Airport Branch */}
            <div className="p-3 bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-blue-500/10 rounded-lg flex justify-center items-center text-blue-500 flex-shrink-0">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-white text-sm sm:text-base font-semibold font-['Inter']">
                    Airport Branch
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 text-sm font-medium font-['Inter']">
                    Good
                  </span>
                  <span className="text-white text-sm sm:text-base font-bold font-['Inter']">
                    $9,240
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-blue-500 rounded-full" />
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-sm text-slate-400 font-['Inter'] pt-0.5">
                <span>198 covers</span>
                <span>
                  Health:{' '}
                  <span className="text-blue-400 font-semibold font-['Inter']">84/100</span>
                </span>
              </div>
            </div>

            {/* 3. City Center */}
            <div className="p-3 bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-purple-500/10 rounded-lg flex justify-center items-center text-purple-500 flex-shrink-0">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-white text-sm sm:text-base font-semibold font-['Inter']">
                    City Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 text-sm font-medium font-['Inter']">
                    Good
                  </span>
                  <span className="text-white text-sm sm:text-base font-bold font-['Inter']">
                    $7,680
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[64%] h-full bg-indigo-500 rounded-full" />
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-sm text-slate-400 font-['Inter'] pt-0.5">
                <span>162 covers</span>
                <span>
                  Health:{' '}
                  <span className="text-indigo-400 font-semibold font-['Inter']">78/100</span>
                </span>
              </div>
            </div>

            {/* 4. Marina Branch */}
            <div className="p-3 bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 bg-amber-500/10 rounded-lg flex justify-center items-center text-amber-500 flex-shrink-0">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-white text-sm sm:text-base font-semibold font-['Inter']">
                    Marina Branch
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm font-medium font-['Inter']">
                    Needs Attention
                  </span>
                  <span className="text-white text-sm sm:text-base font-bold font-['Inter']">
                    $4,120
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[36%] h-full bg-amber-500 rounded-full" />
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-sm text-slate-400 font-['Inter'] pt-0.5">
                <span>89 covers</span>
                <span>
                  Health:{' '}
                  <span className="text-amber-500 font-semibold font-['Inter']">70/100</span>
                </span>
              </div>
            </div>
          </div>

          {/* AI Alert Banner */}
          <div className="px-3.5 py-2.5 bg-[#261B0E]/60 border border-[#7C3408]/30 rounded-xl flex items-center gap-2 mt-1">
            <Sparkles className="size-3.5 text-amber-500 flex-shrink-0" />
            <span className="text-amber-500 text-sm font-medium font-['Inter'] leading-4">
              AI: Marina Branch is underperforming by 31%. Consider a targeted local promotion.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Last Section: Team Performance, Customer Intelligence & Tavonza Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Card 1: Team Performance */}
        <div className="p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-base">👥</span>
            <h4 className="text-white text-base font-semibold font-heading leading-5">
              Team Performance
            </h4>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Sarah */}
            <div className="flex items-center gap-2.5">
              <div className="size-5 bg-green-500/10 rounded-lg flex justify-center items-center text-green-500 flex-shrink-0">
                <span className="text-xs">✓</span>
              </div>
              <span className="text-slate-400 text-sm font-normal font-['Inter'] leading-5">
                Sarah served 34 tables today
              </span>
            </div>

            {/* 2. Michael */}
            <div className="flex items-center gap-2.5">
              <div className="size-5 bg-amber-500/10 rounded-lg flex justify-center items-center text-amber-500 flex-shrink-0">
                <span className="text-xs">⚠️</span>
              </div>
              <span className="text-slate-400 text-sm font-normal font-['Inter'] leading-5">
                Michael&apos;s service time is 18% slower
              </span>
            </div>

            {/* 3. Kitchen team */}
            <div className="flex items-center gap-2.5">
              <div className="size-5 bg-indigo-500/10 rounded-lg flex justify-center items-center text-indigo-400 flex-shrink-0">
                <Star className="w-2.5 h-2.5 text-indigo-400" />
              </div>
              <span className="text-slate-400 text-sm font-normal font-['Inter'] leading-5">
                Kitchen team: 95% order accuracy
              </span>
            </div>

            {/* 4. Support */}
            <div className="flex items-center gap-2.5">
              <div className="size-5 bg-slate-400/10 rounded-lg flex justify-center items-center text-slate-400 flex-shrink-0">
                <span className="text-xs">⚡</span>
              </div>
              <span className="text-slate-400 text-sm font-normal font-['Inter'] leading-5">
                2 employees may need support at dinner
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Customer Intelligence */}
        <div className="p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-pink-500 text-base">♡</span>
            <h4 className="text-white text-base font-semibold font-heading leading-5">
              Customer Intelligence
            </h4>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* Donut Donut Circular Chart */}
            <div className="relative size-20 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="4.5"
                />
                {/* Returning 61% (Indigo / Blue-Purple) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#6366F1"
                  strokeWidth="4.5"
                  strokeDasharray="88"
                  strokeDashoffset="34.3"
                  strokeLinecap="round"
                />
                {/* New 39% (Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="4.5"
                  strokeDasharray="88"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-bold font-heading">61%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 font-['Inter'] text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 bg-indigo-500 rounded-full" />
                <span className="text-slate-400">
                  Returning <strong className="text-white font-bold ml-1">61%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 bg-green-500 rounded-full" />
                <span className="text-slate-400">
                  New <strong className="text-white font-bold ml-1">39%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* AI Insight banner */}
          <div className="p-2.5 bg-indigo-500/5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-indigo-500/20 w-full mt-1">
            <span className="text-indigo-400 text-xs font-semibold font-['Inter']">
              AI Insight:{' '}
            </span>
            <span className="text-indigo-300 text-xs font-normal font-['Inter']">
              Families are ordering more combo meals on weekends.
            </span>
          </div>
        </div>

        {/* Card 3: Tavonza Card */}
        <div className="p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-base">💳</span>
              <h4 className="text-indigo-400 text-base font-semibold font-heading leading-5">
                Tavonza Card
              </h4>
            </div>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 rounded-[5px] border border-indigo-500/20 text-indigo-400 text-xs font-medium font-['Inter']">
              Coming Soon
            </span>
          </div>

          <div className="pt-1">
            <div className="text-white text-3xl sm:text-4xl font-bold font-heading leading-8">
              $24,850
            </div>
            <div className="text-slate-400 text-sm font-normal font-['Inter'] mt-0.5">
              Current Balance
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-slate-400 text-[10px] font-normal font-['Inter']">
                Employee Cards
              </div>
              <div className="text-white text-sm font-bold font-['Inter'] mt-0.5">
                12 Active
              </div>
            </div>

            <div className="p-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-slate-400 text-[10px] font-normal font-['Inter']">
                Supplier Pay
              </div>
              <div className="text-white text-sm font-bold font-['Inter'] mt-0.5">
                Tomorrow
              </div>
            </div>

            <div className="p-2 bg-neutral-800 rounded-lg flex flex-col justify-center items-center text-center">
              <div className="text-slate-400 text-[10px] font-normal font-['Inter']">
                AI Budget
              </div>
              <div className="text-white text-sm font-bold font-['Inter'] mt-0.5">
                Healthy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Action: Ask Tavonza AI */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => {
            // Trigger AI assistant
            const btn = document.querySelector('[data-ai-assistant-btn]') as HTMLButtonElement | null;
            if (btn) btn.click();
          }}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-white font-bold text-base rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
          <span>Ask Tavonza AI</span>
        </button>
      </div>
    </section>
  );
}
