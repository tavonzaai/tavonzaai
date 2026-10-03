'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Clock, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface HourlyData {
  hour: string;
  revenue: number;
  orders: number;
}

const HOURLY_METRICS: HourlyData[] = [
  { hour: '10AM', revenue: 780, orders: 32 },
  { hour: '11AM', revenue: 1340, orders: 54 },
  { hour: '12PM', revenue: 3620, orders: 132 },
  { hour: '1PM', revenue: 4220, orders: 156 },
  { hour: '2PM', revenue: 2410, orders: 92 },
  { hour: '3PM', revenue: 1150, orders: 44 },
  { hour: '4PM', revenue: 1330, orders: 52 },
];

const TOP_ITEMS = [
  { name: 'Grilled Chicken', category: 'Mains · Grill', qty: 94, revenue: '$1,692' },
  { name: 'Truffle Mushroom Pasta', category: 'Mains · Pasta', qty: 94, revenue: '$1,755' },
  { name: 'Crispy Calamari', category: 'Starters', qty: 94, revenue: '$1,755' },
  { name: 'Craft IPA Beer', category: 'Beverages', qty: 94, revenue: '$1,755' },
  { name: 'New York Cheesecake', category: 'Desserts', qty: 94, revenue: '$1,755' },
];

export default function ReportsView() {
  const [activeReportTab, setActiveReportTab] = useState<string>('Sales report');
  const [hoveredHour, setHoveredHour] = useState<HourlyData | null>(null);

  const reportTabs = [
    'Sales report',
    'Staff report',
    'Kitchen report',
    'Payments report',
    'Operations report',
  ];

  // Chart dimensions and scales
  const maxRevenue = 4500;
  const maxOrders = 160;
  const chartHeight = 175; // SVG chart inner height
  const chartWidth = 760;

  // Calculate SVG points for Order volume curve
  const points = HOURLY_METRICS.map((d, index) => {
    const x = (index / (HOURLY_METRICS.length - 1)) * (chartWidth - 80) + 40;
    const y = chartHeight - (d.orders / maxOrders) * chartHeight + 10;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1] ?? point;
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
  }, '');

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl animate-in fade-in duration-200 font-['Inter']">
      {/* 1. Header matching Figma */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-white text-3xl font-semibold leading-9 font-['Inter']">
              Operational reports
            </h1>
            <div className="px-2.5 py-1 bg-teal-500/10 rounded-full outline outline-1 outline-offset-[-1px] outline-teal-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-400 text-xs font-medium leading-4">Live POS sync</span>
            </div>
          </div>
          <p className="text-neutral-400 text-xs font-normal leading-5">
            Downtown Main Branch · Shift #1042 (Morning/Lunch)
          </p>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics matching Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Gross sales */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Gross sales</span>
            <span className="text-white text-2xl font-medium tracking-tight">$14,850.00</span>
          </div>
          <span className="text-neutral-400 text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">+12.4%</span> vs yesterday
          </span>
        </div>

        {/* Total Orders */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Total Orders</span>
            <span className="text-white text-2xl font-medium tracking-tight">482</span>
          </div>
          <span className="text-neutral-400 text-sm font-medium flex items-center gap-1">
            <span className="text-emerald-400">+8.1%</span> volume target met
          </span>
        </div>

        {/* Avg prep speed */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Avg prep speed</span>
            <span className="text-white text-2xl font-medium tracking-tight">11m 45s</span>
          </div>
          <span className="text-teal-400 text-sm font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            1m under limit
          </span>
        </div>

        {/* Active staff / occupancy */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Active staff / occupancy</span>
            <div>
              <span className="text-white text-2xl font-medium tracking-tight">12 / </span>
              <span className="text-yellow-400 text-2xl font-medium tracking-tight">82%</span>
            </div>
          </div>
          <span className="text-neutral-400 text-sm font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            12 active floor staff
          </span>
        </div>
      </div>

      {/* 3. Report Filter Chips matching Figma */}
      <div className="flex flex-wrap items-center gap-2">
        {reportTabs.map((tab) => {
          const isActive = activeReportTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveReportTab(tab)}
              className={`px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] text-sm font-medium font-['Poppins'] transition cursor-pointer select-none ${
                isActive
                  ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-md'
                  : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. Secondary 3 KPI Cards matching Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total revenue */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Total revenue</span>
            <span className="text-green-500 text-2xl font-medium tracking-tight">$14,850.00</span>
          </div>
          <span className="text-neutral-400 text-xs font-semibold leading-5">
            Net total excluding taxes & tips ($1,210 tax collected)
          </span>
        </div>

        {/* Total orders fulfilled */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Total orders fulfilled</span>
            <span className="text-white text-2xl font-medium tracking-tight">482</span>
          </div>
          <span className="text-neutral-400 text-sm font-medium leading-5">
            382 dine-in · 74 takeout · 26 delivery
          </span>
        </div>

        {/* Average order value (AOV) */}
        <div className="h-32 px-6 py-4 bg-neutral-900 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-neutral-400 text-sm font-medium">Average order value (AOV)</span>
            <span className="text-yellow-400 text-2xl font-medium tracking-tight">$30.81</span>
          </div>
          <span className="text-neutral-400 text-sm font-medium leading-5">
            + $2.40 increase vs yesterday’s lunch shift
          </span>
        </div>
      </div>

      {/* 5. Hourly Sales & Order Volume Trend Chart matching Figma & Screenshot */}
      <div className="rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 bg-neutral-900 overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-2xl font-semibold leading-7">
              Hourly Sales & Order Volume Trend
            </h2>
            <p className="text-neutral-500 text-sm font-normal font-['Poppins']">
              Peak dining activity occurred between 12:00 PM and 2:00 PM
            </p>
          </div>

          <div className="h-10 px-3.5 py-2 bg-green-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-green-500/40 flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 text-sm font-normal font-['Poppins']">
              Direct POS hourly feed
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-2 rounded-xs bg-green-500" />
            <span className="text-neutral-400 text-xs font-normal">Revenue ($)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-sky-400 relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute" />
            </span>
            <span className="text-neutral-400 text-xs font-normal">Order volume</span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="px-4 pb-6 pt-2 relative overflow-x-auto">
          <div className="min-w-[760px] h-72 relative flex">
            {/* Left Y-axis (Revenue $) */}
            <div className="w-12 h-52 flex flex-col justify-between items-end pr-2 text-neutral-400 text-[10px] select-none">
              <span>4,500</span>
              <span>4,000</span>
              <span>3,500</span>
              <span>3,000</span>
              <span>2,500</span>
              <span>2,000</span>
              <span>1,500</span>
              <span>1,000</span>
              <span>500</span>
              <span>0</span>
            </div>

            {/* Main Chart Canvas */}
            <div className="flex-1 h-52 relative border-b border-neutral-800">
              {/* Horizontal Grid lines */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((line) => (
                <div
                  key={line}
                  style={{ top: `${(line / 9) * 100}%` }}
                  className="absolute left-0 right-0 h-px bg-neutral-800/80 pointer-events-none"
                />
              ))}

              {/* Bars + SVG Line Overlay */}
              <div className="absolute inset-0 flex justify-between items-end px-6 z-10">
                {HOURLY_METRICS.map((metric) => {
                  const barHeightPercent = (metric.revenue / maxRevenue) * 100;
                  const isHovered = hoveredHour?.hour === metric.hour;

                  return (
                    <div
                      key={metric.hour}
                      onMouseEnter={() => setHoveredHour(metric)}
                      onMouseLeave={() => setHoveredHour(null)}
                      className="flex flex-col items-center justify-end h-full w-20 relative cursor-pointer group"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 bg-neutral-950 border border-neutral-700 px-3 py-1.5 rounded-lg shadow-2xl flex flex-col items-center pointer-events-none text-xs">
                          <span className="text-white font-medium">{metric.hour}</span>
                          <span className="text-green-400 font-semibold">
                            ${metric.revenue.toLocaleString()}
                          </span>
                          <span className="text-sky-400 font-medium">{metric.orders} orders</span>
                        </div>
                      )}

                      {/* Revenue Bar matching exact green from Figma/Screenshot */}
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-14 bg-green-500 rounded-t-md transition-all duration-200 group-hover:brightness-110 ${
                          isHovered ? 'ring-2 ring-green-400' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Order Volume SVG Curved Line with dots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                {/* Curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]"
                />
                {/* Dots */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#38bdf8"
                      stroke="#0a0a0a"
                      strokeWidth="2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="2"
                      fill="#ffffff"
                    />
                  </g>
                ))}
              </svg>
            </div>

            {/* Right Y-axis (Order Volume) */}
            <div className="w-10 h-52 flex flex-col justify-between items-start pl-2 text-neutral-400 text-[10px] select-none">
              <span>160</span>
              <span>140</span>
              <span>120</span>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="min-w-[760px] pl-12 pr-10 flex justify-between items-center text-neutral-400 text-xs font-normal pt-3">
            {HOURLY_METRICS.map((m) => (
              <span key={m.hour} className="w-20 text-center font-['Inter']">
                {m.hour}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bottom 2 Cards Grid matching Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling menu items Table */}
        <div className="p-4 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-1">
            <h3 className="text-white text-base font-semibold font-['Inter']">
              Top selling menu items
            </h3>
            <span className="text-neutral-400 text-xs font-medium font-['Inter']">
              By quantity sold
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left text-sm font-['Inter']">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-neutral-300 font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">QTY</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {TOP_ITEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-900/60 transition">
                    <td className="px-4 py-3 text-neutral-200 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{item.category}</td>
                    <td className="px-4 py-3 text-right text-neutral-200 font-medium">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-green-500 font-semibold">
                      {item.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by order channel Breakdown */}
        <div className="p-5 bg-neutral-950 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-base font-semibold font-['Inter']">
              Sales by Order Channel
            </h3>

            <div className="flex flex-col gap-4">
              {/* Dine-in */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div>
                    <span className="text-white">Dine-in </span>
                    <span className="text-neutral-400 text-xs font-normal">(382 orders)</span>
                  </div>
                  <div>
                    <span className="text-white">$11,850.00 </span>
                    <span className="text-neutral-400 text-xs font-normal">(79.8%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '79.8%' }} />
                </div>
              </div>

              {/* Takeout / Counter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div>
                    <span className="text-white">Takeout / Counter </span>
                    <span className="text-neutral-400 text-xs font-normal">(74 orders)</span>
                  </div>
                  <div>
                    <span className="text-white">$2,100.00 </span>
                    <span className="text-neutral-400 text-xs font-normal">(14.1%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '14.1%' }} />
                </div>
              </div>

              {/* Online delivery */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <div>
                    <span className="text-white">Online delivery </span>
                    <span className="text-neutral-400 text-xs font-normal">(26 orders)</span>
                  </div>
                  <div>
                    <span className="text-white">$900.00 </span>
                    <span className="text-neutral-400 text-xs font-normal">(6.1%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-fuchsia-400 rounded-full" style={{ width: '6.1%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom callout note */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            <p className="text-neutral-300 text-xs leading-5">
              Dine-in continues to drive the highest average ticket size ($31.02 per order).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
