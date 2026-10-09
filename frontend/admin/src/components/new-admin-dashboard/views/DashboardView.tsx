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
  REVENUE_PERIOD_DATA,
  BUSINESS_HEALTH_METRICS,
} from '../data';
import { AdminNavTab } from '../types';

interface DashboardViewProps {
  onNavigateTab?: (tab: AdminNavTab) => void;
}

export default function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState<'All' | 'Week' | 'Month' | 'Year'>('Week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rawName = user?.name || 'Robert';
  const firstName = rawName.split(' ')[0] || 'Robert';

  const chartData = useMemo(() => {
    return REVENUE_PERIOD_DATA[selectedPeriod] || REVENUE_PERIOD_DATA.Week;
  }, [selectedPeriod]);

  // Compute SVG Path points dynamically for the chart
  const { pathD, areaD, points, maxVal } = useMemo(() => {
    const values = chartData.map((d) => d.value);
    const max = Math.max(...values, 20) * 1.15;
    const width = 590;
    const height = 180;
    const paddingX = 30;
    const paddingY = 20;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const pts = chartData.map((item, idx) => {
      const x = paddingX + (idx / (chartData.length - 1)) * usableWidth;
      const y = height - paddingY - (item.value / max) * usableHeight;
      return { x, y, ...item };
    });

    if (pts.length === 0) return { pathD: '', areaD: '', points: [], maxVal: max };

    // Create smooth curved path
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const mx = (curr.x + next.x) / 2;
      d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }

    const area = `${d} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { pathD: d, areaD: area, points: pts, maxVal: max };
  }, [chartData]);

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
        <div className="lg:col-span-7 xl:col-span-8 p-6 lg:p-8 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col gap-6 shadow-xl">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white text-lg font-semibold font-sans leading-5">
                Revenue Overview
              </h2>
              <p className="text-neutral-400 text-xs font-normal font-sans mt-1">
                Monitor your business performance across different time periods.
              </p>
            </div>

            {/* Segmented Filter */}
            <div className="h-9 inline-flex rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900/80 shrink-0">
              {(['All', 'Week', 'Month', 'Year'] as const).map((period, idx) => {
                const isActive = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`h-9 px-3.5 text-xs font-medium font-sans transition-all ${
                      idx !== 0 ? 'border-l border-neutral-700' : ''
                    } ${
                      isActive
                        ? 'bg-yellow-500/30 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="relative w-full rounded-lg outline outline-[0.5px] outline-white/10 bg-neutral-950/40 p-4 overflow-hidden">
            <div className="h-64 w-full relative">
              <svg
                viewBox="0 0 590 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glowing Gradient fill matching user's spec: from-yellow-500/25 to-orange-500/0 */}
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.30" />
                    <stop offset="70%" stopColor="#f97316" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                  </linearGradient>

                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                {[40, 85, 130, 175].map((yVal, i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={yVal}
                    x2="570"
                    y2={yVal}
                    stroke="#27272a"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Filled Area */}
                {areaD && (
                  <path
                    d={areaD}
                    fill="url(#revenueGrad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Stroke Path Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Data Points and Hover Interaction */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill="#eab308"
                        stroke="#000000"
                        strokeWidth="2"
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />

                      {/* Tooltip on hover */}
                      {isHovered && (
                        <g transform={`translate(${pt.x}, ${pt.y - 32})`}>
                          <rect
                            x="-36"
                            y="-12"
                            width="72"
                            height="24"
                            rx="5"
                            fill="#18181b"
                            stroke="#eab308"
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="4"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="Inter"
                          >
                            {pt.formatted}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center px-4 pt-3 border-t border-neutral-800/80">
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className={`text-xs font-sans transition-colors cursor-pointer ${
                    hoveredIndex === i ? 'text-amber-400 font-semibold' : 'text-neutral-400'
                  }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {d.day}
                </div>
              ))}
            </div>

            {/* Y-Axis Reference Pill */}
            <div className="flex justify-between items-center px-4 pt-2 text-[10px] text-neutral-500 font-sans">
              <span>Low Range: $0</span>
              <span>Average: $14.2k</span>
              <span>Peak: $20.0k+</span>
            </div>
          </div>
        </div>

        {/* Right Column: Business Health Card (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 backdrop-blur-xl flex flex-col justify-between gap-6 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-white text-base font-semibold font-sans">
              Business Health
            </h2>
            <div className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full inline-flex items-center">
              <span className="text-green-500 text-[10px] font-semibold font-sans tracking-wide">
                Excellent
              </span>
            </div>
          </div>

          {/* Circular Score Gauge */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <div className="relative size-36 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#27272a"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Indigo Layer */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  fill="none"
                  className="opacity-70"
                />

                {/* Primary Emerald/Green Layer */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="22.6"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Golden Accent Marker */}
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="200"
                  strokeDashoffset="70"
                  fill="none"
                  className="opacity-40"
                />
              </svg>

              {/* Score Value Center */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-white text-4xl font-bold font-sans tracking-tight leading-8">
                  91
                </span>
                <span className="text-slate-400 text-xs font-normal font-sans mt-0.5">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="space-y-3 pt-2">
            {BUSINESS_HEALTH_METRICS.map((metric) => (
              <div key={metric.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-slate-400 font-normal">{metric.name}</span>
                  <span className="text-green-500 font-semibold">{metric.score}</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${metric.color}`}
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
