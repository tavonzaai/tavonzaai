'use client';

import React, { useState } from 'react';
import { BIRevenueForecastPoint } from '../types';

export interface RevenueForecastChartProps {
  data: BIRevenueForecastPoint[];
}

export default function RevenueForecastChart({
  data,
}: RevenueForecastChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const yLabels = [
    { label: '$22k', y: 15 },
    { label: '$17k', y: 55 },
    { label: '$11k', y: 95 },
    { label: '$06k', y: 135 },
    { label: '$0k', y: 175 },
  ];
  const maxVal = 22; // in thousands

  const width = 530;
  const height = 190;
  const baselineY = 175;
  const paddingX = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = baselineY - (d.revenue / maxVal) * (baselineY - 15);
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

  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

  return (
    <div className="w-full bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 md:p-7 relative flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Revenue Forecast — This Week
        </h3>
        <p className="text-neutral-400 text-sm font-normal font-['Inter'] mt-1">
          Weekly revenue performance for the selected period.
        </p>
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 flex items-stretch gap-3.5">
        {/* Y Axis */}
        <div className="relative w-11 shrink-0 select-none text-right text-sm text-neutral-400 font-['Inter'] h-52">
          {yLabels.map((lbl) => (
            <span
              key={lbl.label}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(lbl.y / height) * 100}%` }}
            >
              {lbl.label}
            </span>
          ))}
        </div>

        {/* Graph Area */}
        <div className="relative flex-1 h-52">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="biForecastGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.30" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 1. Warm Area Fill */}
            <path d={areaPath} fill="url(#biForecastGrad)" />

            {/* 2. Crisp Grid lines (Rendered on top of gradient for clear visibility) */}
            {yLabels.map((lbl, idx) => (
              <line
                key={`h-${idx}`}
                x1={points[0].x}
                y1={lbl.y}
                x2={points[points.length - 1].x}
                y2={lbl.y}
                stroke="rgba(255, 255, 255, 0.22)"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
            ))}

            {points.map((pt, idx) => (
              <line
                key={`v-${idx}`}
                x1={pt.x}
                y1={15}
                x2={pt.x}
                y2={baselineY}
                stroke="rgba(255, 255, 255, 0.22)"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
            ))}

            {/* 3. Golden Line */}
            <path
              d={curvePath}
              fill="none"
              stroke="#eab308"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Start Dot (Mon) */}
            <circle
              cx={points[0].x}
              cy={points[0].y}
              r="4"
              className="fill-orange-500"
            />

            {/* End Dot (Sun) */}
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              className="fill-orange-500"
            />

            {/* Interactive Points & Markers */}
            {points.map((p, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Invisible generous hit target (36px wide) */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={18}
                    fill="transparent"
                  />

                  {/* Glow circle on hover */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={10}
                      fill="#eab308"
                      fillOpacity={0.3}
                    />
                  )}

                  {/* Point circle */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
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

          {/* Tooltip positioned directly above hovered point */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-neutral-950/95 border border-yellow-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white shadow-2xl pointer-events-none z-30 font-['Inter'] whitespace-nowrap animate-in fade-in duration-100"
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
                ${(points[hoveredIdx].revenue * 1000).toLocaleString()} (Projected)
              </span>
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-neutral-950 border-r border-b border-yellow-500/50 rotate-45" />
            </div>
          )}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between pl-14 pr-2 pt-3 text-sm text-neutral-400 font-['Inter'] select-none">
        {data.map((d, i) => (
          <span
            key={i}
            className={`w-7 text-center transition-colors ${
              hoveredIdx === i ? 'text-yellow-400 font-semibold' : ''
            }`}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
