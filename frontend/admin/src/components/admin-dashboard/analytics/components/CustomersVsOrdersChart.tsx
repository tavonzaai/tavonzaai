'use client';

import React, { useState } from 'react';
import { CustomersVsOrdersPoint } from '../types';

export interface CustomersVsOrdersChartProps {
  data?: CustomersVsOrdersPoint[];
}

export default function CustomersVsOrdersChart({}: CustomersVsOrdersChartProps) {
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

  const yTicks = ['600', '450', '300', '150', '0'];
  const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sta', 'Sun'];

  const width = 953;
  const height = 208;

  // Exact vertices matching the Figma code and screenshot
  const points = [
    { x: 0, y: 208, label: 'Mon', orders: 0, customers: 0, hasMarker: true },
    { x: 70, y: 105, label: 'Mon (Mid)', orders: 280, customers: 215, hasMarker: true },
    { x: 160, y: 155, label: 'Tue', orders: 150, customers: 120 },
    { x: 302, y: 74, label: 'Wed', orders: 370, customers: 290, hasMarker: true },
    { x: 450, y: 175, label: 'Thu', orders: 95, customers: 80 },
    { x: 584, y: 39, label: 'Fri (Peak)', orders: 475, customers: 380, hasMarker: true },
    { x: 675, y: 175, label: 'Fri (Late)', orders: 95, customers: 75 },
    { x: 765, y: 105, label: 'Sta', orders: 280, customers: 230, hasMarker: true },
    { x: 953, y: 208, label: 'Sun', orders: 0, customers: 0, hasMarker: true },
  ];

  const polylineD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaD = `${polylineD} L ${width} ${height} L 0 ${height} Z`;

  const markers = points.filter((p) => p.hasMarker);

  return (
    <div className="w-full bg-[#111113]/95 rounded-[10px] border border-white/10 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] p-6 md:p-7 relative flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Customers vs Orders
        </h3>
        <p className="text-slate-400 text-sm md:text-base font-normal font-['Inter'] mt-1">
          Daily comparison of order count and unique customers.
        </p>
      </div>

      {/* Chart Canvas */}
      <div className="mt-7 flex items-stretch gap-3.5">
        {/* Y Axis */}
        <div className="flex flex-col justify-between text-right text-sm text-neutral-400 font-['Inter'] py-1 w-8 shrink-0 select-none">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        {/* Graph Area */}
        <div className="relative flex-1 h-52 md:h-56">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yTicks.map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-zinc-800/80 border-dashed h-0"
              />
            ))}
          </div>

          {/* Vertical Boundary Lines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            <div className="h-full border-r border-zinc-800/80 border-dashed w-0" />
            <div className="h-full border-r border-zinc-800/80 border-dashed w-0" />
          </div>

          {/* SVG Polyline & Area */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="ordersExactGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaD} fill="url(#ordersExactGrad)" />

            {/* Golden Zig-Zag Line */}
            <path
              d={polylineD}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Markers with generous hit areas */}
            {markers.map((pt, idx) => {
              const isHovered = hoveredMarker === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredMarker(idx)}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  {/* Invisible generous hit target (36px wide) */}
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
                      r={11}
                      fill="#f97316"
                      fillOpacity={0.25}
                    />
                  )}

                  {/* Visible Ball Marker */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 8 : 6.5}
                    fill="#52525b"
                    stroke="#f97316"
                    strokeWidth={isHovered ? 3 : 2.5}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Positioned Directly Above the Hovered Ball */}
          {hoveredMarker !== null && (
            <div
              className="absolute bg-neutral-950/95 border border-orange-500/60 rounded-lg px-3 py-1.5 text-sm text-white shadow-2xl pointer-events-none z-30 font-['Inter'] whitespace-nowrap animate-in fade-in duration-100"
              style={{
                left: `${(markers[hoveredMarker].x / width) * 100}%`,
                top: `${(markers[hoveredMarker].y / height) * 100}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <div className="font-semibold text-white mb-0.5">
                {markers[hoveredMarker].label}
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-yellow-400 font-medium">
                  {markers[hoveredMarker].orders} Orders
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-blue-400 font-medium">
                  {markers[hoveredMarker].customers} Customers
                </span>
              </div>
              {/* Tooltip downward pointer notch */}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-neutral-950 border-r border-b border-orange-500/60 rotate-45" />
            </div>
          )}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between pl-11 pr-2 pt-3 text-sm text-neutral-400 font-['Inter'] select-none">
        {xLabels.map((label) => (
          <span key={label} className="text-center w-8">
            {label}
          </span>
        ))}
      </div>

      {/* Legend Footer */}
      <div className="flex justify-center items-center gap-6 pt-4 border-t border-white/5 mt-3 text-sm font-['Inter']">
        <div className="flex items-center gap-2">
          <span className="size-2.5 bg-yellow-500 rounded-full" />
          <span className="text-yellow-400 font-medium">Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 bg-blue-500 rounded-full" />
          <span className="text-blue-400 font-medium">Customers</span>
        </div>
      </div>
    </div>
  );
}
