'use client';

import React, { useState } from 'react';
import { HourlyRevenuePoint } from '../types';

interface HourlyRevenueChartProps {
  data: HourlyRevenuePoint[];
}

export default function HourlyRevenueChart({ data }: HourlyRevenueChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    amount: number;
    hour: string;
    x: number;
    y: number;
  } | null>(null);

  // Chart coordinate space
  const svgWidth = 987;
  const svgHeight = 176;
  const maxVal = 2200;

  // Compute points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * svgWidth;
    const y = svgHeight - (d.amount / maxVal) * (svgHeight - 20) - 10;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2 || !pts[0]) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      if (!p0 || !p1 || !p2 || !p3) continue;

      // Control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  // Y-axis grid levels
  const yTicks = [2200, 1650, 1100, 550, 0];

  return (
    <div className="w-full bg-white/10 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-white/10 p-5 sm:p-6 font-['Inter'] relative backdrop-blur-md">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold leading-tight">
          Hourly Revenue
        </h2>
        <p className="text-neutral-400 text-sm font-normal mt-1">
          Revenue trend this week
        </p>
      </div>

      {/* Chart Layout: Y-Axis + Graph Canvas */}
      <div className="flex items-stretch gap-4">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between items-end text-slate-500 text-xs font-normal h-44 pb-2 pr-1 select-none flex-shrink-0">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        {/* SVG Graph Container */}
        <div className="flex-1 flex flex-col">
          <div className="relative w-full h-44 rounded-[5px] outline outline-[0.5px] outline-white/20 overflow-hidden bg-black/40">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yTicks.map((_, i) => (
                <div key={i} className="w-full h-0 border-b border-dashed border-zinc-700/40" />
              ))}
            </div>

            {/* Vertical Grid lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {data.map((_, i) => (
                <div key={i} className="h-full w-0 border-r border-dashed border-zinc-700/30" />
              ))}
            </div>

            {/* SVG Wave & Points */}
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueAmberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity="0.45" />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Area Gradient Fill */}
              <path d={areaPath} fill="url(#revenueAmberGrad)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#EAB308"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]"
              />

              {/* Interactive Dots */}
              {points.map((pt, index) => {
                const isHovered = hoveredPoint?.index === index;
                return (
                  <g key={index}>
                    {/* Hover target halo */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          index,
                          amount: pt.amount,
                          hour: pt.hour,
                          x: pt.x,
                          y: pt.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Visible Amber Node */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '6' : '4.5'}
                      fill="#F59E0B"
                      stroke="#000"
                      strokeWidth="1.5"
                      className="transition-all duration-150 pointer-events-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none bg-zinc-900 border border-amber-500/40 px-2.5 py-1 rounded-md text-xs font-semibold text-white shadow-xl transform -translate-x-1/2 -translate-y-full mb-2 z-20"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <div className="text-amber-400 font-bold">${hoveredPoint.amount}</div>
                <div className="text-zinc-400 text-[10px] font-normal">{hoveredPoint.hour}</div>
              </div>
            )}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between items-center text-slate-300 text-xs font-normal mt-2.5 px-1 select-none">
            {data.map((d, idx) => (
              <span key={idx}>{d.hour}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
