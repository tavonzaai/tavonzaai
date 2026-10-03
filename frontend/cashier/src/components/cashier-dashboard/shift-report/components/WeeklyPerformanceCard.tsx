'use client';

import React, { useState } from 'react';
import { WeeklyPerformancePoint } from '../types';

interface WeeklyPerformanceCardProps {
  data: WeeklyPerformancePoint[];
}

const Y_TICKS = [
  { label: '1400', value: 14000 },
  { label: '10500', value: 10500 },
  { label: '7000', value: 7000 },
  { label: '3500', value: 3500 },
  { label: '$0', value: 0 },
];

export const WeeklyPerformanceCard: React.FC<WeeklyPerformanceCardProps> = ({
  data,
}) => {
  const [hoveredDay, setHoveredDay] = useState<WeeklyPerformancePoint | null>(
    null
  );

  const maxVal = 14000;
  const width = 450;
  const height = 176;
  const paddingX = 20;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x =
      paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - (d.revenue / maxVal) * (height - 20) - 10;
    return { x, y, ...d };
  });

  // Generate cubic Bezier path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    if (!prev) return acc;
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = lastPoint && firstPoint
    ? `${linePath} L ${lastPoint.x},${height} L ${firstPoint.x},${height} Z`
    : '';

  return (
    <div className="h-80 bg-white/10 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/10 p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
          Weekly Performance
        </h3>
        <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
          Revenue trend this week
        </p>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 flex items-end pt-4 pb-2">
        {/* Y-axis */}
        <div className="w-12 h-44 flex flex-col justify-between items-end pr-2 text-right">
          {Y_TICKS.map((tick) => (
            <span
              key={tick.label}
              className="text-white text-sm font-normal font-['Inter'] leading-none"
            >
              {tick.label}
            </span>
          ))}
        </div>

        {/* SVG Curve Area */}
        <div className="relative flex-1 h-44 border-b border-zinc-700">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Y_TICKS.map((tick, idx) => (
              <div
                key={tick.label}
                className={`w-full border-b ${
                  idx === Y_TICKS.length - 1
                    ? 'border-transparent'
                    : 'border-zinc-700/40 border-dashed'
                }`}
              />
            ))}
          </div>

          {/* Vertical Grid lines */}
          <div className="absolute inset-0 flex justify-between px-5 pointer-events-none">
            {data.map((d) => (
              <div
                key={d.day}
                className="h-full border-r border-zinc-700/30 border-dashed"
              />
            ))}
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="weeklyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#eab308" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill */}
            <path d={areaPath} fill="url(#weeklyAreaGrad)" />

            {/* Line Stroke */}
            <path
              d={linePath}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Nodes */}
            {points.map((pt) => {
              const isHovered = hoveredDay?.day === pt.day;
              return (
                <g key={pt.day}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    className="fill-orange-500 stroke-zinc-900 cursor-pointer transition-all"
                    strokeWidth="1.5"
                    onMouseEnter={() => setHoveredDay(pt)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip on Hover */}
          {hoveredDay && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black/90 border border-amber-400/50 px-3 py-1 rounded-lg text-center shadow-xl pointer-events-none">
              <span className="text-sm font-bold text-amber-400 font-['JetBrains_Mono']">
                {hoveredDay.day}: ${hoveredDay.revenue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* X-axis Labels */}
      <div className="flex pl-12 pr-4 justify-between">
        {data.map((point) => (
          <span
            key={point.day}
            className="w-7 text-center text-white text-sm font-normal font-['Inter']"
          >
            {point.day}
          </span>
        ))}
      </div>
    </div>
  );
};
