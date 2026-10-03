'use client';

import React, { useState } from 'react';
import { HourlyRevenuePoint } from '../types';

interface RevenueByHourCardProps {
  data: HourlyRevenuePoint[];
}

const Y_TICKS = [2200, 1650, 1100, 550, 0];

export const RevenueByHourCard: React.FC<RevenueByHourCardProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HourlyRevenuePoint | null>(null);

  const maxVal = 2200;

  return (
    <div className="h-80 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
          Revenue by Hour
        </h3>
        <p className="text-neutral-400 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
          Today&apos;s performance timeline
        </p>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 flex items-end pt-4 pb-2">
        {/* Y-axis Labels & Grid Lines */}
        <div className="w-10 h-44 flex flex-col justify-between items-end pr-2 text-right">
          {Y_TICKS.map((tick) => (
            <span
              key={tick}
              className="text-white text-sm font-normal font-['Inter'] leading-none"
            >
              {tick}
            </span>
          ))}
        </div>

        {/* Plot Area */}
        <div className="relative flex-1 h-44 border-b border-zinc-700">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {Y_TICKS.map((tick, idx) => (
              <div
                key={tick}
                className={`w-full border-b ${
                  idx === Y_TICKS.length - 1
                    ? 'border-transparent'
                    : 'border-zinc-700/50 border-dashed'
                }`}
              />
            ))}
          </div>

          {/* Bar Columns */}
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {data.map((point) => {
              const heightPct = Math.min(100, Math.round((point.revenue / maxVal) * 100));
              const isHovered = hoveredPoint?.hour === point.hour;

              return (
                <div
                  key={point.hour}
                  className="relative flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-black/90 border border-yellow-500/40 px-2.5 py-1 rounded-lg text-center shadow-xl pointer-events-none whitespace-nowrap">
                      <div className="text-xs font-bold text-yellow-400 font-['JetBrains_Mono']">
                        ${point.revenue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-300 font-['Inter']">
                        {point.transactions} txns
                      </div>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-7 md:w-8 rounded-tl-[5px] rounded-tr-[5px] transition-all duration-300 ${
                      isHovered
                        ? 'bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                        : 'bg-yellow-500 hover:bg-yellow-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-axis Labels */}
      <div className="flex pl-10 pr-2 justify-between">
        {data.map((point) => (
          <span
            key={point.hour}
            className="w-7 md:w-8 text-center text-white text-sm font-normal font-['Inter']"
          >
            {point.hour}
          </span>
        ))}
      </div>
    </div>
  );
};
