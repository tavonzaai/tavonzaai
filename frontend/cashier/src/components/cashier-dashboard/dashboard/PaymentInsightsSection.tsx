'use client';

import React, { useState } from 'react';
import { mockPaymentBreakdown } from '../data';

export default function PaymentInsightsSection() {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Donut SVG configuration
  // Total circumference C = 2 * PI * R
  const R = 46;
  const C = 2 * Math.PI * R; // ~289.0265
  const strokeWidth = 24;

  const blueLen = 0.46 * C;
  const orangeLen = 0.19 * C;
  const tealLen = 0.35 * C;

  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
            Payment Insights
          </h2>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-4 mt-1">
            Today&apos;s Payment Breakdown
          </p>
        </div>

        {/* Circular Donut Chart */}
        <div className="flex items-center justify-center my-4 relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-120 filter drop-shadow-md"
              viewBox="0 0 140 140"
            >
              {/* Blue Segment: Credit/Debit Cards (46%) */}
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="transparent"
                stroke="#3B82F6"
                strokeWidth={hoveredSegment === 'Credit/Debit Cards' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${blueLen} ${C}`}
                strokeDashoffset="0"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('Credit/Debit Cards')}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Orange/Amber Segment: Cash (19%) */}
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth={hoveredSegment === 'Cash' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${orangeLen} ${C}`}
                strokeDashoffset={-blueLen}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('Cash')}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Teal/Green Segment: QR Payments (35%) */}
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="transparent"
                stroke="#10B981"
                strokeWidth={hoveredSegment === 'QR Payments' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${tealLen} ${C}`}
                strokeDashoffset={-(blueLen + orangeLen)}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('QR Payments')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </svg>

            {/* Inner Center Hole Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredSegment ? (
                <div className="text-center animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-white text-lg font-bold font-['Inter'] leading-none">
                    {hoveredSegment === 'Credit/Debit Cards'
                      ? '46%'
                      : hoveredSegment === 'QR Payments'
                      ? '35%'
                      : '19%'}
                  </span>
                  <span className="block text-[10px] text-zinc-400 mt-0.5 leading-tight font-['Inter']">
                    {hoveredSegment === 'Credit/Debit Cards' ? 'Cards' : hoveredSegment}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Breakdown Legend Rows */}
        <div className="space-y-2.5 mt-2">
          {mockPaymentBreakdown.map((item) => {
            const isHovered = hoveredSegment === item.label;
            const dotColor =
              item.label === 'Credit/Debit Cards'
                ? 'bg-blue-500'
                : item.label === 'QR Payments'
                ? 'bg-emerald-500'
                : 'bg-amber-500';

            const textColor =
              item.label === 'Credit/Debit Cards'
                ? 'text-blue-500'
                : item.label === 'QR Payments'
                ? 'text-emerald-500'
                : 'text-amber-500';

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredSegment(item.label)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between text-sm font-['Inter'] px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  isHovered ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`size-2 rounded-full flex-shrink-0 ${dotColor}`} />
                  <span className="text-slate-300 font-normal font-['Inter']">
                    {item.label}
                  </span>
                </div>
                <span className={`font-semibold font-['Inter'] ${textColor}`}>
                  {`${item.percentage}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="mt-4 p-3 bg-blue-950/30 rounded-xl outline outline-1 outline-offset-[-1px] outline-blue-500/25 border border-blue-500/20 flex items-start gap-2">
        <p className="text-blue-200 text-xs font-normal font-['Inter'] leading-relaxed">
          <span className="font-semibold text-blue-300">AI Insight:</span> Digital payments reduce checkout time by 32%. Encourage QR payments during peak hours.
        </p>
      </div>
    </div>
  );
}
