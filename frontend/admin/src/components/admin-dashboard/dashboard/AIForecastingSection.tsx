'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ReservationItem } from '../types';

export interface AIForecastingSectionProps {
  forecastData: { day: string; actual: number; predicted: number; peak: boolean }[];
  cashflowData: { month: string; inflow: number; outflow: number; net: number }[];
  reservations: ReservationItem[];
}

export default function AIForecastingSection({
  forecastData,
  cashflowData,
  reservations,
}: AIForecastingSectionProps) {
  return (
    <section className="space-y-4 mt-16">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2">
          AI Forecasting & Future Outlook
        </h3>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Left Card: AI Revenue Forecast */}
        <div className="p-6 sm:p-7 bg-[#141416] rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col justify-between space-y-5">
          {/* Header with Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-white text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
                AI Revenue Forecast
              </h4>
              <p className="text-zinc-400 text-sm sm:text-base font-normal font-['Inter'] mt-1">
                Actual vs. AI-predicted — next 7 days
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-2 bg-[#FFB800] rounded-full inline-block shadow-[0_0_6px_rgba(255,184,0,0.4)]" />
                <span className="text-[#FFB800] text-sm font-normal font-['Inter']">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-2 border-2 border-dashed border-white/80 bg-white/10 rounded-sm inline-block" />
                <span className="text-white text-sm font-normal font-['Inter']">
                  Forecast
                </span>
              </div>
            </div>
          </div>

          {/* Chart with Left Y-Axis & Bars */}
          <div className="relative w-full h-64 pt-2 flex items-stretch">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-left text-zinc-300 text-base font-normal font-['Inter'] pr-3 select-none pb-7">
              <span>$24k</span>
              <span>$18k</span>
              <span>$12k</span>
              <span>$6k</span>
              <span>$0k</span>
            </div>

            {/* Grid & Bars Area */}
            <div className="relative flex-1 flex flex-col justify-between">
              {/* Grid Box */}
              <div className="relative flex-1 w-full rounded-xl border border-dashed border-zinc-800/80 overflow-hidden flex items-end justify-between px-2 sm:px-3 pb-0">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full h-px" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px" />
                </div>

                {/* SVG Forecast Trend Dashed Line connecting predicted points */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                  viewBox="0 0 700 200"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 50,96 L 150,84 L 250,73.6 L 350,54.4 L 450,23.2 L 550,4 L 650,41.6"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.75"
                    strokeDasharray="4 4"
                    className="opacity-60"
                  />
                  {[
                    { cx: 50, cy: 96 },
                    { cx: 150, cy: 84 },
                    { cx: 250, cy: 73.6 },
                    { cx: 350, cy: 54.4 },
                    { cx: 450, cy: 23.2, peak: true },
                    { cx: 550, cy: 4, peak: true },
                    { cx: 650, cy: 41.6 },
                  ].map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={pt.peak ? 4 : 3}
                      fill={pt.peak ? '#FFB800' : '#ffffff'}
                      stroke="#141416"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>

                {/* 7 Day Grouped Bars (Actual & Forecast) */}
                {(forecastData && forecastData.length > 0
                  ? forecastData
                  : [
                      { day: 'Mon', actual: 12, predicted: 13, peak: false },
                      { day: 'Tue', actual: 14, predicted: 14.5, peak: false },
                      { day: 'Wed', actual: 16, predicted: 15.8, peak: false },
                      { day: 'Thus', actual: 0, predicted: 18.2, peak: false },
                      { day: 'Friday', actual: 0, predicted: 22.1, peak: true },
                      { day: 'Sat', actual: 0, predicted: 24.5, peak: true },
                      { day: 'Sun', actual: 0, predicted: 19.8, peak: false },
                    ]
                ).map((item, idx) => {
                  const actualHeight = item.actual > 0 ? `${(item.actual / 25) * 100}%` : '0%';
                  const forecastHeight = `${(item.predicted / 25) * 100}%`;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative px-0.5"
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-700 text-[11px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-30">
                        <span className="font-semibold text-amber-400">{item.day}: </span>
                        {item.actual > 0 && <span>Actual ${item.actual}k · </span>}
                        <span>Forecast ${item.predicted}k</span>
                      </div>

                      {/* Side-by-side Bars Container */}
                      <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full">
                        {/* Actual Bar (Solid Amber) */}
                        {item.actual > 0 ? (
                          <div
                            style={{ height: actualHeight }}
                            className="w-2.5 sm:w-3.5 md:w-4 bg-[#FFB800] rounded-t-md transition-all duration-500 shadow-[0_0_8px_rgba(255,184,0,0.35)] group-hover:brightness-110"
                          />
                        ) : null}

                        {/* Forecast Bar (Dashed Outline) */}
                        <div
                          style={{ height: forecastHeight }}
                          className={`w-2.5 sm:w-3.5 md:w-4 border-2 border-dashed rounded-t-md transition-all duration-500 ${
                            item.peak
                              ? 'border-amber-400/90 bg-amber-400/15 shadow-[0_0_8px_rgba(255,184,0,0.25)]'
                              : 'border-white/70 bg-white/10 shadow-[0_0_6px_rgba(255,255,255,0.12)]'
                          } group-hover:bg-white/20`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between text-center text-zinc-300 text-sm sm:text-base font-medium font-['Inter'] pt-3 px-1">
                {['Mon', 'Tue', 'Wed', 'Thus', 'Friday', 'Sat', 'Sun'].map((d, idx) => (
                  <span key={idx} className="hover:text-amber-400 transition-colors">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom 3 Metric Cards matching Image */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-amber-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                $88,800
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                This Week Est.
              </div>
            </div>

            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-white text-base sm:text-lg font-bold font-['Inter'] leading-5">
                $22,100
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                Weekend Peak
              </div>
            </div>

            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-emerald-400 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                +17.4%
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                vs Last Week
              </div>
            </div>
          </div>
        </div>

        {/* 2. Right Card: Cash Flow */}
        <div className="p-6 sm:p-7 bg-[#141416] rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col justify-between space-y-5">
          {/* Header with Legend & Finance link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-white text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
                Cash Flow
              </h4>
              <p className="text-zinc-400 text-sm sm:text-base font-normal font-['Inter'] mt-1">
                Inflow vs. outflow — last 6 months
              </p>
            </div>

            {/* Legend & Finance Link */}
            <div className="flex items-center gap-3.5 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-2 bg-[#FFB800] rounded-full inline-block shadow-[0_0_6px_rgba(255,184,0,0.4)]" />
                <span className="text-[#FFB800] text-sm font-normal font-['Inter']">
                  Inflow
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-2 bg-zinc-500 rounded-full inline-block" />
                <span className="text-zinc-400 text-sm font-normal font-['Inter']">
                  Outflow
                </span>
              </div>
              <span className="text-amber-500 text-sm sm:text-base font-medium font-['Inter'] flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer pl-1">
                Finance <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Chart with Left Y-Axis & Bars */}
          <div className="relative w-full h-64 pt-2 flex items-stretch">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-left text-zinc-300 text-base font-normal font-['Inter'] pr-3 select-none pb-7">
              <span>$80k</span>
              <span>$60k</span>
              <span>$40k</span>
              <span>$20k</span>
              <span>$0k</span>
            </div>

            {/* Grid & Bars Area */}
            <div className="relative flex-1 flex flex-col justify-between">
              {/* Grid Box */}
              <div className="relative flex-1 w-full rounded-xl border border-dashed border-zinc-800/80 overflow-hidden flex items-end justify-between px-3 sm:px-4 pb-0">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full h-px" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px border-t border-dashed border-zinc-800/60" />
                  <div className="w-full h-px" />
                </div>

                {/* 6 Month Grouped Bars: Inflow (Amber) & Outflow (Zinc) */}
                {(cashflowData && cashflowData.length > 0
                  ? cashflowData
                  : [
                      { month: 'Feb', inflow: 42, outflow: 31, net: 11 },
                      { month: 'Mar', inflow: 54, outflow: 38, net: 16 },
                      { month: 'Apr', inflow: 61, outflow: 42, net: 19 },
                      { month: 'May', inflow: 58, outflow: 41, net: 17 },
                      { month: 'Jun', inflow: 74, outflow: 49, net: 25 },
                      { month: 'Jul', inflow: 88, outflow: 56, net: 32 },
                    ]
                ).map((item, idx) => {
                  const inflowHeight = `${(item.inflow / 100) * 100}%`;
                  const outflowHeight = `${(item.outflow / 100) * 100}%`;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative px-1 sm:px-2"
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-700 text-[11px] text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-30">
                        <span className="font-semibold text-amber-400">{item.month}: </span>
                        <span>Inflow ${item.inflow}k · </span>
                        <span>Outflow ${item.outflow}k · </span>
                        <span className="text-emerald-400">Net +${item.net}k</span>
                      </div>

                      {/* Grouped Side-by-Side Bars */}
                      <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full">
                        {/* Inflow Bar (Amber) */}
                        <div
                          style={{ height: inflowHeight }}
                          className="w-2.5 sm:w-3.5 md:w-4.5 bg-[#FFB800] rounded-t-md transition-all duration-500 shadow-[0_0_8px_rgba(255,184,0,0.35)] group-hover:brightness-110"
                        />

                        {/* Outflow Bar (Zinc) */}
                        <div
                          style={{ height: outflowHeight }}
                          className="w-2.5 sm:w-3.5 md:w-4.5 bg-zinc-500/80 border border-zinc-400/30 rounded-t-md transition-all duration-500 group-hover:bg-zinc-400/90 shadow-[0_0_6px_rgba(113,113,122,0.2)]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between text-center text-zinc-300 text-sm sm:text-base font-medium font-['Inter'] pt-3 px-1">
                {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, idx) => (
                  <span key={idx} className="hover:text-amber-400 transition-colors">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom 3 Metric Cards matching Image */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-amber-500 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                $88,800
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                This Week Est.
              </div>
            </div>

            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-white text-base sm:text-lg font-bold font-['Inter'] leading-5">
                $22,100
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                Weekend Peak
              </div>
            </div>

            <div className="py-3 px-3 bg-[#222226] rounded-xl flex flex-col justify-center items-center text-center">
              <div className="text-emerald-400 text-base sm:text-lg font-bold font-['Inter'] leading-5">
                +17.4%
              </div>
              <div className="text-zinc-400 text-xs font-normal font-['Inter'] leading-4 mt-0.5">
                vs Last Week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Forecast Row */}
      <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl space-y-4 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold text-white">Reservation Forecast</h4>
            <p className="text-sm text-zinc-400">Tonight's incoming bookings · 47 covers expected</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              5 Reservations
            </span>
            <span className="text-sm font-medium text-amber-400 flex items-center gap-1 cursor-pointer">
              Tables <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">{res.time}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                    res.status === 'confirmed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {res.status}
                </span>
              </div>
              <div className="text-sm font-semibold text-white truncate">{res.guestName}</div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800">
                <span>{res.table}</span>
                <span>{res.guests} guests</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-zinc-400 pt-2    gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 4 Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 1 Pending
            </span>
          </div>
          <div>
            <span className="text-zinc-400">Est. Dinner Revenue: </span>
            <span className="font-bold text-emerald-400">$1,840</span>
          </div>
        </div>
      </div>
    </section>
  );
}
