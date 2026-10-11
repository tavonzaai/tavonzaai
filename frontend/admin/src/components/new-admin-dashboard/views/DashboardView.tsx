'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  GitBranch,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import {
  INITIAL_METRICS,
  BUSINESS_HEALTH_METRICS,
} from '../data';
import { AdminNavTab } from '../types';

interface DashboardViewProps {
  onNavigateTab?: (tab: AdminNavTab) => void;
}

const REVENUE_TIMEFRAME_DATASETS = {
  Week: {
    yLabels: ['$20', '$15', '$10', '$5', '$0'],
    xLabels: ['Mon', 'Tue', 'Wed', 'The', 'Fri', 'Sta', 'Sun'],
    areaPath:
      'M 0,140 C 70,128 100,120 170,135 C 240,150 280,105 370,78 C 450,55 500,28 580,28 C 640,28 670,48 700,56 L 700,220 L 0,220 Z',
    linePath:
      'M 0,140 C 70,128 100,120 170,135 C 240,150 280,105 370,78 C 450,55 500,28 580,28 C 640,28 670,48 700,56',
    startDot: { x: 2, y: 140 },
    endDot: { x: 698, y: 56 },
  },
  Month: {
    yLabels: ['$80k', '$60k', '$40k', '$20k', '$0'],
    xLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    areaPath:
      'M 0,165 C 100,140 160,95 240,115 C 340,135 440,65 540,42 C 610,28 660,35 700,45 L 700,220 L 0,220 Z',
    linePath:
      'M 0,165 C 100,140 160,95 240,115 C 340,135 440,65 540,42 C 610,28 660,35 700,45',
    startDot: { x: 2, y: 165 },
    endDot: { x: 698, y: 45 },
  },
  Year: {
    yLabels: ['$300k', '$225k', '$150k', '$75k', '$0'],
    xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    areaPath:
      'M 0,170 C 80,150 140,160 200,135 C 280,100 360,120 440,80 C 520,50 600,40 700,25 L 700,220 L 0,220 Z',
    linePath:
      'M 0,170 C 80,150 140,160 200,135 C 280,100 360,120 440,80 C 520,50 600,40 700,25',
    startDot: { x: 2, y: 170 },
    endDot: { x: 698, y: 25 },
  },
  All: {
    yLabels: ['$1.2M', '$900k', '$600k', '$300k', '$0'],
    xLabels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    areaPath:
      'M 0,180 C 100,165 200,145 320,110 C 440,75 560,45 700,25 L 700,220 L 0,220 Z',
    linePath:
      'M 0,180 C 100,165 200,145 320,110 C 440,75 560,45 700,25',
    startDot: { x: 2, y: 180 },
    endDot: { x: 698, y: 25 },
  },
};

export default function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState<'All' | 'Week' | 'Month' | 'Year'>('Week');

  const rawName = user?.name || 'Robert';
  const firstName = rawName.split(' ')[0] || 'Robert';

  const currentDataset = REVENUE_TIMEFRAME_DATASETS[selectedPeriod] || REVENUE_TIMEFRAME_DATASETS.Week;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-semibold font-sans tracking-tight leading-9">
            Good morning, {firstName}
          </h1>
          <p className="text-zinc-500 text-base font-normal font-sans leading-6 mt-1">
            Here’s what’s happening across Tavonza Group today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
            <Sparkles className="size-3.5" />
            AI Co-Pilot Active
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Restaurants */}
        <div
          onClick={() => onNavigateTab?.('restaurants')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Restaurants
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Store className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              3
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-sm font-normal font-sans leading-4">
                +1 this month
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Branches */}
        <div
          onClick={() => onNavigateTab?.('branches')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Branches
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <GitBranch className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              4
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-sm font-normal font-sans leading-4">
                Across 3 restaurants
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Staff */}
        <div
          onClick={() => onNavigateTab?.('permissions')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Staff
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Users className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              48
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-sm font-normal font-sans leading-4">
                +6 this month
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div
          onClick={() => onNavigateTab?.('payments')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Revenue
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <DollarSign className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              $2M
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-sm font-normal font-sans leading-4">
                +12.4% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row: Revenue Overview + Business Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Revenue Overview (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 p-6 lg:p-7 bg-[#121316] rounded-2xl border border-neutral-800/80 flex flex-col justify-between shadow-xl">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-white text-xl sm:text-2xl font-bold font-sans tracking-tight">
                Revenue Overview
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm font-normal font-sans mt-1">
                Monitor your business performance across different time periods.
              </p>
            </div>

            {/* Segmented Filter Pills Matching Image 1 */}
            <div className="inline-flex items-center bg-[#18181b] border border-neutral-800 rounded-xl overflow-hidden p-0.5 shrink-0 self-start sm:self-auto">
              {(['All', 'Week', 'Month', 'Year'] as const).map((period) => {
                const isActive = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium font-sans transition-all cursor-pointer rounded-lg ${
                      isActive
                        ? 'bg-[#4d3d13] text-[#fef08a] font-semibold border border-amber-500/20 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart Area with Left Y-axis & Golden Wave Matching Image 1 */}
          <div className="relative w-full h-64 sm:h-72 pt-3 flex items-stretch">
            {/* Y-Axis Labels on the Left */}
            <div className="flex flex-col justify-between text-left text-neutral-400 text-xs sm:text-sm font-normal font-sans pr-3 sm:pr-4 select-none pb-7">
              {currentDataset.yLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>

            {/* Chart Grid & SVG Curve Area */}
            <div className="relative flex-1 flex flex-col justify-between">
              {/* Grid Container */}
              <div className="relative flex-1 w-full overflow-hidden">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                  <div className="w-full h-px border-t border-dashed border-neutral-800" />
                  <div className="w-full h-px border-t border-dashed border-neutral-800" />
                  <div className="w-full h-px border-t border-dashed border-neutral-800" />
                  <div className="w-full h-px border-t border-dashed border-neutral-800" />
                  <div className="w-full h-px border-t border-dashed border-neutral-800" />
                </div>

                {/* Vertical Grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none z-0">
                  {currentDataset.xLabels.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full w-px ${
                        idx === 0 || idx === currentDataset.xLabels.length - 1
                          ? ''
                          : 'border-r border-dashed border-neutral-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Glowing SVG Golden Wave Chart */}
                <svg
                  key={selectedPeriod}
                  viewBox="0 0 700 220"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible transition-all duration-500 relative z-10"
                >
                  <defs>
                    <linearGradient id="revenueGoldenWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.40" />
                      <stop offset="35%" stopColor="#d97706" stopOpacity="0.25" />
                      <stop offset="75%" stopColor="#92400e" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#121316" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="revenueGoldenGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Area Fill Gradient */}
                  <path
                    d={currentDataset.areaPath}
                    fill="url(#revenueGoldenWaveGrad)"
                  />

                  {/* Top Glowing Golden Wave Line */}
                  <path
                    d={currentDataset.linePath}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    filter="url(#revenueGoldenGlow)"
                  />

                  {/* Start & End Golden Dots matching Image 1 */}
                  <circle
                    cx={currentDataset.startDot.x}
                    cy={currentDataset.startDot.y}
                    r="3.5"
                    fill="#fbbf24"
                  />
                  <circle
                    cx={currentDataset.endDot.x}
                    cy={currentDataset.endDot.y}
                    r="3.5"
                    fill="#fbbf24"
                  />
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between text-center text-neutral-400 text-xs sm:text-sm font-medium font-sans pt-3 px-1">
                {currentDataset.xLabels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Business Health Card (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 bg-[#121316] rounded-2xl border border-neutral-800/80 backdrop-blur-xl flex flex-col justify-between gap-6 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-white text-base sm:text-lg font-semibold font-sans">
              Business Health
            </h2>
            <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/20 rounded-full inline-flex items-center">
              <span className="text-emerald-400 text-xs font-semibold font-sans tracking-wide">
                Excellent
              </span>
            </div>
          </div>

          {/* 3-Color Donut Gauge Matching Image 1 */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative size-44 flex items-center justify-center">
              <svg className="size-full" viewBox="0 0 160 160">
                {/* Segment 1: Vibrant Green (from 220° to 52° clockwise) */}
                <path
                  d="M 44.65 122.13 A 55 55 0 1 1 123.34 46.14"
                  fill="none"
                  stroke="#00c853"
                  strokeWidth="26"
                  strokeLinecap="butt"
                />

                {/* Segment 2: Royal Periwinkle Blue (from 52° to 106° clockwise) */}
                <path
                  d="M 123.34 46.14 A 55 55 0 0 1 132.87 95.16"
                  fill="none"
                  stroke="#5b75f5"
                  strokeWidth="26"
                  strokeLinecap="butt"
                />

                {/* Segment 3: Golden Amber (from 106° to 220° clockwise) */}
                <path
                  d="M 132.87 95.16 A 55 55 0 0 1 44.65 122.13"
                  fill="none"
                  stroke="#f9a825"
                  strokeWidth="26"
                  strokeLinecap="butt"
                />
              </svg>

              {/* Score Value Center */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-white text-4xl sm:text-5xl font-bold font-sans tracking-tight leading-none">
                  91
                </span>
                <span className="text-neutral-400 text-xs font-medium font-sans mt-1">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {BUSINESS_HEALTH_METRICS.map((metric) => (
              <div key={metric.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-sans">
                  <span className="text-neutral-400 font-normal">{metric.name}</span>
                  <span className="text-emerald-400 font-semibold">{metric.score}</span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric.name === 'Operations' || metric.name === 'Staff'
                        ? 'bg-[#5b75f5]'
                        : 'bg-[#00c853]'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
