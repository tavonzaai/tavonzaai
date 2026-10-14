'use client';

import React, { useState } from 'react';
import { MrrDataPoint } from '@/redux/features/superadminApi';
import { formatCurrency } from '@/lib/utils';

interface MrrChartProps {
  data: MrrDataPoint[];
}

export function MrrChart({ data }: MrrChartProps) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // If yearly, scale values up by 12x or use revenue
  const multiplier = timeframe === 'yearly' ? 12 : 1;
  const chartData = data.map((d) => ({
    ...d,
    displayValue: d.mrr * multiplier,
  }));

  const maxVal = 30000 * multiplier;
  const minVal = 0;

  // Chart dimensions in SVG coordinates
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 20;
  const paddingY = 20;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  // Calculate points
  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * usableWidth;
    const yRatio = (d.displayValue - minVal) / (maxVal - minVal);
    const y = svgHeight - paddingY - yRatio * usableHeight;
    return { x, y, data: d };
  });

  // Construct smooth bezier SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  const yLabels = timeframe === 'monthly'
    ? ['$30k', '$20k', '$10k', '$0']
    : ['$360k', '$240k', '$120k', '$0'];

  return (
    <div className="w-full p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between">
      {/* Top Header & Monthly/Yearly Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h3 className="text-white text-base font-semibold font-inter leading-5">
            MRR trend
          </h3>
          <p className="text-neutral-400 text-xs font-normal font-inter leading-4 pt-1">
            Recurring revenue over the last 12 months.
          </p>
        </div>

        {/* Toggle Pills matching Figma exact outline & colors */}
        <div className="inline-flex rounded-md border border-neutral-700 bg-neutral-900 p-0.5">
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-l-md text-xs font-normal font-inter transition-all ${
              timeframe === 'monthly'
                ? 'bg-yellow-500/30 text-yellow-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('yearly')}
            className={`px-3 py-1.5 rounded-r-md text-xs font-normal font-inter transition-all ${
              timeframe === 'yearly'
                ? 'bg-yellow-500/30 text-yellow-300 font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Chart Canvas with Grid & Axes */}
      <div className="relative pt-2 pl-9 pr-2">
        {/* Y-Axis Labels matching Figma */}
        <div className="absolute left-0 top-2 bottom-9 flex flex-col justify-between text-neutral-400 text-[10px] font-normal font-inter pointer-events-none select-none">
          {yLabels.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* SVG Chart Area */}
        <div className="relative w-full h-56 border-b border-zinc-800">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              {/* Yellow gradient area */}
              <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#facc15" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
              </linearGradient>

              {/* Horizontal grid lines */}
              <pattern id="grid" width={svgWidth} height={svgHeight / 3} patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
              </pattern>
            </defs>

            {/* Grid background */}
            <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

            {/* Area Fill */}
            <path d={areaD} fill="url(#mrrGradient)" />

            {/* Glowing Main Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#facc15"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
            />

            {/* Interactive Points & Hover Tooltips */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  {/* Invisible Hit Target */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Visible Data Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 3.5}
                    fill="#facc15"
                    stroke="#000000"
                    strokeWidth={2}
                    className="transition-all duration-150 pointer-events-none"
                  />

                  {/* Vertical guide on hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={0}
                      x2={pt.x}
                      y2={svgHeight}
                      stroke="#facc15"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.6"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip when hovering over a point */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-xl text-center animate-fade-in"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / svgHeight) * 100}%`,
              }}
            >
              <div className="text-[10px] text-zinc-400 font-inter">
                {points[hoveredIndex].data.fullMonth}
              </div>
              <div className="text-xs font-semibold text-yellow-400 font-inter">
                {formatCurrency(points[hoveredIndex].data.displayValue)}
              </div>
            </div>
          )}
        </div>

        {/* X-Axis Month Labels matching Figma */}
        <div className="flex justify-between items-center pt-2.5 text-neutral-400 text-[10px] font-normal font-inter select-none">
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jun</span>
        </div>
      </div>
    </div>
  );
}
