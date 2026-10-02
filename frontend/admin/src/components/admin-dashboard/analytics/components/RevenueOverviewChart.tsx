'use client';

import React, { useState } from 'react';
import { DailyRevenuePoint } from '../types';

export interface RevenueOverviewChartProps {
  data: DailyRevenuePoint[];
}

export default function RevenueOverviewChart({ data }: RevenueOverviewChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const yLabels = ['$20k', '$15k', '$10k', '$5k', '$0k'];
  const maxVal = 20; // in thousands

  const width = 530;
  const height = 180;
  const paddingX = 15;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - (d.revenue / maxVal) * height;
    return { x, y, ...d };
  });

  // Construct smooth cubic Bezier curve
  const curvePath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 md:p-7 relative flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Revenue Overview
        </h3>
        <p className="text-neutral-400 text-sm font-normal font-['Inter'] mt-1">
          Daily revenue performance for the selected period.
        </p>
      </div>

      {/* Chart Canvas */}
      <div className="mt-7 flex items-stretch gap-3.5">
        {/* Y Axis */}
        <div className="flex flex-col justify-between text-right text-sm text-neutral-400 font-['Inter'] py-1 w-11 shrink-0 select-none">
          {yLabels.map((lbl) => (
            <span key={lbl}>{lbl}</span>
          ))}
        </div>

        {/* Graph Area */}
        <div className="relative flex-1 h-48 md:h-52">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yLabels.map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-zinc-800/70 border-dashed h-0"
              />
            ))}
          </div>

          {/* Vertical Grid lines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {data.map((_, idx) => (
              <div
                key={idx}
                className="h-full border-r border-zinc-800/70 border-dashed w-0 first:border-r-0 last:border-r-0"
              />
            ))}
          </div>

          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="analyticsRevenueGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaPath} fill="url(#analyticsRevenueGrad)" />

            {/* Golden Line */}
            <path
              d={curvePath}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Interactive Points & Markers */}
            {points.map((p, idx) => {
              const isHovered = hoveredIdx === idx;
              const isEndpoint = idx === 0 || idx === points.length - 1;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Invisible generous hit target (32px wide) */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={16}
                    fill="transparent"
                  />

                  {/* Glow circle on hover */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={10}
                      fill="#eab308"
                      fillOpacity={0.25}
                    />
                  )}

                  {/* Point circle */}
                  {(isEndpoint || isHovered) && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5.5 : 4}
                      fill={isEndpoint ? '#f97316' : '#eab308'}
                      stroke="#000000"
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip positioned directly above hovered point */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-neutral-950/95 border border-yellow-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white shadow-2xl pointer-events-none z-20 font-['Inter'] whitespace-nowrap animate-in fade-in duration-100"
              style={{
                left: `${(points[hoveredIdx].x / width) * 100}%`,
                top: `${(points[hoveredIdx].y / height) * 100}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <span className="font-semibold text-yellow-400">
                {points[hoveredIdx].day}:
              </span>{' '}
              <span className="font-bold text-white">
                ${(points[hoveredIdx].revenue * 1000).toLocaleString()}
              </span>
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-neutral-950 border-r border-b border-yellow-500/50 rotate-45" />
            </div>
          )}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between pl-14 pr-1 pt-3 text-sm text-neutral-400 font-['Inter'] select-none">
        {data.map((d, i) => (
          <span
            key={i}
            className={`w-6 text-center ${hoveredIdx === i ? 'text-yellow-400 font-semibold' : ''
              }`}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
