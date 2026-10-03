'use client';

import React from 'react';

export interface RevenueAndHealthSectionProps {
  timeRange: 'All' | 'Week' | 'Month' | 'Year';
  setTimeRange: (range: 'All' | 'Week' | 'Month' | 'Year') => void;
  revenueData?: { label: string; revenue: number; orders: number; forecast: number }[];
}

export default function RevenueAndHealthSection({
  timeRange,
  setTimeRange,
}: RevenueAndHealthSectionProps) {
  const tabs: ('All' | 'Week' | 'Month' | 'Year')[] = ['All', 'Week', 'Month', 'Year'];

  const timeRangeDatasets = {
    Week: {
      yLabels: ['$20', '$15', '$10', '$5', '$0'],
      xLabels: ['Mon', 'Tue', 'Wed', 'The', 'Fri', 'Sta', 'Sun'],
      areaPath: 'M 0,140 C 70,128 100,120 170,135 C 240,150 280,105 370,78 C 450,55 500,28 580,28 C 640,28 670,48 700,56 L 700,220 L 0,220 Z',
      linePath: 'M 0,140 C 70,128 100,120 170,135 C 240,150 280,105 370,78 C 450,55 500,28 580,28 C 640,28 670,48 700,56',
      startDot: { x: 2, y: 140 },
      endDot: { x: 698, y: 56 },
    },
    Month: {
      yLabels: ['$80k', '$60k', '$40k', '$20k', '$0'],
      xLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      areaPath: 'M 0,165 C 100,140 160,95 240,115 C 340,135 440,65 540,42 C 610,28 660,35 700,45 L 700,220 L 0,220 Z',
      linePath: 'M 0,165 C 100,140 160,95 240,115 C 340,135 440,65 540,42 C 610,28 660,35 700,45',
      startDot: { x: 2, y: 165 },
      endDot: { x: 698, y: 45 },
    },
    Year: {
      yLabels: ['$300k', '$225k', '$150k', '$75k', '$0'],
      xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      areaPath: 'M 0,170 C 80,150 140,160 200,135 C 280,100 360,120 440,80 C 520,50 600,40 700,25 L 700,220 L 0,220 Z',
      linePath: 'M 0,170 C 80,150 140,160 200,135 C 280,100 360,120 440,80 C 520,50 600,40 700,25',
      startDot: { x: 2, y: 170 },
      endDot: { x: 698, y: 25 },
    },
    All: {
      yLabels: ['$1.2M', '$900k', '$600k', '$300k', '$0'],
      xLabels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      areaPath: 'M 0,180 C 100,165 200,145 320,110 C 440,75 560,45 700,25 L 700,220 L 0,220 Z',
      linePath: 'M 0,180 C 100,165 200,145 320,110 C 440,75 560,45 700,25',
      startDot: { x: 2, y: 180 },
      endDot: { x: 698, y: 25 },
    },
  };

  const currentDataset = timeRangeDatasets[timeRange] || timeRangeDatasets.Week;

  const healthScores = [
    { label: 'Revenue', score: 94, color: 'bg-green-500', width: '94%' },
    { label: 'Operations', score: 90, color: 'bg-indigo-500', width: '90%' },
    { label: 'Inventory', score: 86, color: 'bg-amber-500', width: '86%' },
    { label: 'Customer Sat.', score: 96, color: 'bg-green-500', width: '96%' },
    { label: 'Staff', score: 88, color: 'bg-indigo-500', width: '88%' },
    { label: 'Profitability', score: 91, color: 'bg-green-500', width: '91%' },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left Card: Revenue Overview */}
      <div className="lg:col-span-8 p-4 sm:p-7 bg-[#141416] rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] tracking-tight">
              Revenue Overview
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm font-normal font-['Inter'] mt-1">
              Monitor your business performance across different time periods.
            </p>
          </div>

          {/* Time Range Selector Tabs */}
          <div className="inline-flex items-center bg-[#1c1c1f] border border-zinc-800/90 rounded-xl overflow-hidden p-0.5 self-start sm:self-auto shrink-0">
            {tabs.map((tab) => {
              const isActive = timeRange === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  className={`px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium font-['Inter'] transition-all cursor-pointer rounded-lg ${
                    isActive
                      ? 'bg-[#4d3d13] text-[#fef08a] font-semibold shadow-sm border border-amber-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Area with Left Y-axis & Golden Wave */}
        <div className="relative w-full h-64 sm:h-72 pt-3 flex items-stretch">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-left text-zinc-400 text-xs sm:text-sm md:text-base font-normal font-['Inter'] pr-2 sm:pr-4 select-none pb-7">
            {currentDataset.yLabels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>

          {/* Chart Grid & SVG Curve Area */}
          <div className="relative flex-1 flex flex-col justify-between">
            {/* Grid Container */}
            <div className="relative flex-1 w-full rounded-xl border border-dashed border-zinc-800/80 overflow-hidden bg-[#141416]">
              {/* Horizontal Grid lines (subtle white/zinc above, tinted amber below) */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full h-px" />
                <div className="w-full h-px border-t border-dashed border-white/10" />
                <div className="w-full h-px border-t border-dashed border-white/10" />
                <div className="w-full h-px border-t border-dashed border-white/10" />
                <div className="w-full h-px" />
              </div>

              {/* Vertical Grid lines (subtle white/zinc above, tinted amber below) */}
              <div className="absolute inset-0 flex justify-between pointer-events-none z-0">
                {currentDataset.xLabels.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-full w-px ${
                      idx === 0 || idx === currentDataset.xLabels.length - 1
                        ? ''
                        : 'border-r border-dashed border-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Glowing SVG Golden Wave Chart with gradient fill overlaying the grid */}
              <svg
                key={timeRange}
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible transition-all duration-500 relative z-10"
              >
                <defs>
                  <linearGradient id="revenueGoldenWaveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.40" />
                    <stop offset="35%" stopColor="#D97706" stopOpacity="0.25" />
                    <stop offset="75%" stopColor="#92400E" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#141416" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Area Fill Gradient - tints grid lines below the golden line */}
                <path
                  d={currentDataset.areaPath}
                  fill="url(#revenueGoldenWaveGradient)"
                />

                {/* Top Glowing Golden Wave Line */}
                <path
                  d={currentDataset.linePath}
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  filter="url(#goldenGlow)"
                />

                {/* Start & End Golden Dots matching image */}
                <circle cx={currentDataset.startDot.x} cy={currentDataset.startDot.y} r="3.5" fill="#FBBF24" />
                <circle cx={currentDataset.endDot.x} cy={currentDataset.endDot.y} r="3.5" fill="#FBBF24" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between text-center text-zinc-300 text-sm sm:text-base font-medium font-['Inter'] pt-3 px-1">
              {currentDataset.xLabels.map((lbl, idx) => (
                <span key={idx} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Card: Business Health (size-96 matching Figma) */}
      <div className="lg:col-span-4 p-6 bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-lg font-semibold font-['Inter'] leading-7">
            Business Health
          </h3>
          <div className="px-2 py-0.5 bg-green-500/10 rounded-full flex items-center justify-center">
            <span className="text-green-500 text-xs font-semibold font-['Inter'] leading-4">
              Excellent
            </span>
          </div>
        </div>

        {/* 3-Color Donut Gauge Meter */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative size-36 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 40 40">
              {/* Background ring */}
              <circle
                cx="20"
                cy="20"
                r="15"
                strokeWidth="4.5"
                stroke="#27272a"
                fill="none"
              />
              {/* Segment 1: Green (bg-green-600 ~50%) */}
              <circle
                cx="20"
                cy="20"
                r="15"
                strokeWidth="4.8"
                stroke="#16a34a"
                strokeDasharray="50 100"
                strokeDashoffset="0"
                fill="none"
              />
              {/* Segment 2: Indigo (bg-indigo-500 ~25%) */}
              <circle
                cx="20"
                cy="20"
                r="15"
                strokeWidth="4.8"
                stroke="#6366f1"
                strokeDasharray="25 100"
                strokeDashoffset="-50"
                fill="none"
              />
              {/* Segment 3: Yellow (bg-yellow-500 ~20%) */}
              <circle
                cx="20"
                cy="20"
                r="15"
                strokeWidth="4.8"
                stroke="#eab308"
                strokeDasharray="20 100"
                strokeDashoffset="-75"
                fill="none"
              />
            </svg>

            {/* Center Score */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-white text-4xl font-bold font-['Plus_Jakarta_Sans'] leading-8">
                91
              </span>
              <span className="text-slate-500 text-xs font-normal font-['Inter'] leading-4">
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* 6 Score Breakdown Bars */}
        <div className="space-y-2 mt-2 font-['Inter']">
          {healthScores.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 text-sm font-normal leading-4">
                  {item.label}
                </span>
                <span className="text-green-500 text-sm font-semibold leading-4">
                  {item.score}
                </span>
              </div>
              <div className="h-1 w-full bg-neutral-600 rounded-full overflow-hidden">
                <div
                  style={{ width: item.width }}
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



