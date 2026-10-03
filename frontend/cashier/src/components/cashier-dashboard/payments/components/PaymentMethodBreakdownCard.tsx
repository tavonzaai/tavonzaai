'use client';

import React, { useState } from 'react';
import { PaymentMethodBreakdownItem } from '../types';

interface PaymentMethodBreakdownCardProps {
  breakdown: PaymentMethodBreakdownItem[];
}

export default function PaymentMethodBreakdownCard({
  breakdown,
}: PaymentMethodBreakdownCardProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Donut SVG circumference calculation
  const R = 54;
  const C = 2 * Math.PI * R; // ~339.292
  const strokeWidth = 26;

  // Segments: Cards (46%), QR (35%), Cash (19%)
  const cardsLen = 0.46 * C;
  const qrLen = 0.35 * C;
  const cashLen = 0.19 * C;

  return (
    <div className="w-full bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-5 sm:p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      {/* Title */}
      <div>
        <h2 className="text-white text-lg font-semibold leading-tight mb-6">
          Payment Method Breakdown
        </h2>

        {/* Content: Donut Chart on Left, Breakdown Bars on Right */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 sm:gap-8">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90 filter drop-shadow-md"
              viewBox="0 0 160 160"
            >
              {/* Blue Segment: Credit/Debit Cards (46%) */}
              <circle
                cx="80"
                cy="80"
                r={R}
                fill="transparent"
                stroke="#3B82F6"
                strokeWidth={hoveredSlice === 'Credit/Debit Cards' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${cardsLen} ${C}`}
                strokeDashoffset="0"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('Credit/Debit Cards')}
                onMouseLeave={() => setHoveredSlice(null)}
              />

              {/* Teal Segment: QR Payments (35%) */}
              <circle
                cx="80"
                cy="80"
                r={R}
                fill="transparent"
                stroke="#14B8A6"
                strokeWidth={hoveredSlice === 'QR Payments' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${qrLen} ${C}`}
                strokeDashoffset={-cardsLen}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('QR Payments')}
                onMouseLeave={() => setHoveredSlice(null)}
              />

              {/* Amber Segment: Cash (19%) */}
              <circle
                cx="80"
                cy="80"
                r={R}
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth={hoveredSlice === 'Cash' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${cashLen} ${C}`}
                strokeDashoffset={-(cardsLen + qrLen)}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('Cash')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredSlice ? (
                <div className="text-center animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-white text-xl font-bold">
                    {hoveredSlice === 'Credit/Debit Cards'
                      ? '46%'
                      : hoveredSlice === 'QR Payments'
                      ? '35%'
                      : '19%'}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {hoveredSlice === 'Credit/Debit Cards' ? 'Cards' : hoveredSlice}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-white text-lg font-bold">100%</div>
                  <div className="text-xs text-zinc-400">Settled</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bars & Legend */}
          <div className="flex-1 w-full flex flex-col justify-center gap-5">
            {breakdown.map((item) => {
              const isHovered = hoveredSlice === item.label;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredSlice(item.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex flex-col gap-1.5 transition-all p-1 rounded-md cursor-pointer ${
                    isHovered ? 'bg-white/5' : ''
                  }`}
                >
                  {/* Top Label & Percentage */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                      <span className="text-white font-normal font-sans">
                        {item.label}
                      </span>
                    </div>
                    <span className={`font-semibold font-mono ${item.textColor}`}>
                      {item.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${item.barColor}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
