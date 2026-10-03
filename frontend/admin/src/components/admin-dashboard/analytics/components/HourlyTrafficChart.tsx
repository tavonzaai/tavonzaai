'use client';

import React, { useState } from 'react';
import { HourlyTrafficItem } from '../types';

export interface HourlyTrafficChartProps {
  data: HourlyTrafficItem[];
}

export default function HourlyTrafficChart({ data }: HourlyTrafficChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const yTicks = [100, 75, 50, 25, 0];
  const maxVal = 100;

  return (
    <div className="w-full bg-neutral-900 rounded-[10px] border border-white/5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] p-6 md:p-7 relative flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg md:text-xl font-semibold font-['Inter'] leading-6">
          Hourly Traffic
        </h3>
        <p className="text-slate-400 text-sm font-normal font-['Inter'] mt-1">
          Dine-in vs takeout guests by hour.
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

        {/* Bars Container */}
        <div className="relative flex-1 h-48 md:h-52">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yTicks.map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-zinc-800/70 border-dashed h-0"
              />
            ))}
          </div>

          {/* Bars Flex */}
          <div className="absolute inset-0 flex items-end justify-between px-2 gap-1.5 z-10">
            {data.map((item, idx) => {
              const heightPercent = Math.min((item.total / maxVal) * 100, 100);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.hour}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 bg-neutral-950 border border-yellow-500/40 rounded-lg px-2.5 py-1 text-sm text-white shadow-2xl pointer-events-none z-30 font-['Inter'] whitespace-nowrap">
                      <div className="font-semibold text-yellow-400">
                        {item.hour}: {item.total} guests
                      </div>
                      <div className="text-xs text-zinc-300 flex items-center gap-2">
                        <span className="text-orange-400">Dine-in: {item.dineIn}</span>
                        <span className="text-blue-400">Takeout: {item.takeout}</span>
                      </div>
                    </div>
                  )}

                  {/* Yellow Bar */}
                  <div
                    className={`w-full max-w-[24px] bg-yellow-500 rounded-t-[5px] transition-all duration-300 ${
                      isHovered ? 'brightness-125 scale-y-[1.02]' : 'hover:brightness-110'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between pl-11 pr-2 pt-3 text-xs text-neutral-400 font-['Inter'] select-none">
        {data.map((d, i) => (
          <span
            key={i}
            className={`text-center ${
              hoveredIdx === i ? 'text-yellow-400 font-semibold' : ''
            }`}
          >
            {d.hour}
          </span>
        ))}
      </div>

      {/* Legend Footer */}
      <div className="flex justify-center items-center gap-6 pt-4 border-t border-white/5 mt-3 text-sm font-['Inter']">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-orange-500 rounded-sm" />
          <span className="text-orange-400 font-normal">Dine In</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 bg-blue-500 rounded-sm" />
          <span className="text-blue-400 font-normal">Takeout</span>
        </div>
      </div>
    </div>
  );
}
