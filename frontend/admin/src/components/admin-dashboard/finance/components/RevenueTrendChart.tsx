'use client';

import React, { useState } from 'react';
import { MonthlyTrend } from '../types';

export interface RevenueTrendChartProps {
  data?: MonthlyTrend[];
}

export default function RevenueTrendChart({ }: RevenueTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const yLabels = ['$140k', '$105k', '$70k', '$35k', '$0k'];
  const xLabels = [
    { label: 'Jan', revenue: 52000, x: 0, y: 150 },
    { label: 'Feb', revenue: 60000, x: 95.8, y: 132 },
    { label: 'Mar', revenue: 47000, x: 191.6, y: 152 },
    { label: 'Apr', revenue: 70000, x: 287.4, y: 114 },
    { label: 'May', revenue: 93000, x: 383.2, y: 76 },
    { label: 'Jan', revenue: 122000, x: 479.0, y: 30 },
    { label: 'Jul', revenue: 105000, x: 574.8, y: 58 },
  ];

  const svgWidth = 574.8;
  const svgHeight = 230;

  // Ultra-smooth Bezier curve matching the exact screenshot visual
  const curvePathD = `M 0 150 C 35 140, 60 132, 95.8 132 C 130 132, 155 152, 191.6 152 C 230 152, 255 130, 287.4 114 C 320 98, 350 86, 383.2 76 C 415 66, 445 30, 479 30 C 515 30, 545 46, 574.8 58`;
  const areaPathD = `${curvePathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="w-full bg-[#121214]/90 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 md:p-7 relative flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Revenue vs Expenses vs Profit
        </h3>
        <p className="text-neutral-400 text-sm font-normal font-['Inter'] mt-1">
          Year-to-date revenue progression.
        </p>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-7 flex items-stretch gap-3.5">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-right text-sm text-neutral-400 font-['Inter'] py-1 w-11 shrink-0 select-none">
          {yLabels.map((lbl) => (
            <span key={lbl}>{lbl}</span>
          ))}
        </div>

        {/* Graph Area */}
        <div className="relative flex-1 h-56 md:h-60">
          {/* Subtle Grid System */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {/* Horizontal Grid lines */}
            {yLabels.map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-zinc-800/80 border-dashed h-0"
              />
            ))}
          </div>

          {/* Vertical Grid lines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {xLabels.map((_, idx) => (
              <div
                key={idx}
                className="h-full border-r border-zinc-800/80 border-dashed w-0 first:border-r-0 last:border-r-0"
              />
            ))}
          </div>

          {/* SVG Curve & Gradient */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Golden amber area gradient */}
              <linearGradient
                id="revenueGoldGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.32" />
                <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaPathD} fill="url(#revenueGoldGradient)" />

            {/* Glowing Golden Line */}
            <path
              d={curvePathD}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Start Point Dot (Jan) */}
            <circle
              cx="0"
              cy="150"
              r="4"
              className="fill-yellow-500"
            />

            {/* End Point Dot (Jul) */}
            <circle
              cx={svgWidth}
              cy="58"
              r="4"
              className="fill-yellow-500"
            />

            {/* Interactive hover points with generous hit targets */}
            {xLabels.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Invisible hit target (36px wide) */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                  />

                  {/* Outer glow ring when hovered */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={10}
                      fill="#eab308"
                      fillOpacity={0.3}
                    />
                  )}

                  {/* Visible Point Dot */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={5.5}
                      fill="#eab308"
                      stroke="#000000"
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Positioned Directly Above Hovered Point */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-neutral-950/95 border border-yellow-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white shadow-2xl pointer-events-none z-20 font-['Inter'] whitespace-nowrap animate-in fade-in duration-100"
              style={{
                left: `${(xLabels[hoveredIdx].x / svgWidth) * 100}%`,
                top: `${(xLabels[hoveredIdx].y / svgHeight) * 100}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <span className="font-semibold text-yellow-400">
                {xLabels[hoveredIdx].label} 2025:
              </span>{' '}
              <span className="font-bold text-white">
                ${xLabels[hoveredIdx].revenue.toLocaleString()}
              </span>
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-neutral-950 border-r border-b border-yellow-500/50 rotate-45" />
            </div>
          )}
        </div>
      </div>

      {/* X Axis Month Labels */}
      <div className="flex justify-between pl-14 pr-1 pt-3 text-sm text-neutral-400 font-['Inter'] select-none">
        {xLabels.map((d, i) => (
          <span
            key={i}
            className={`w-6 text-center ${hoveredIdx === i ? 'text-yellow-400 font-semibold' : ''
              }`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
