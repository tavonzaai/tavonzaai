'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Activity,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export interface AIRecommendationItem {
  id: string;
  type: 'workload' | 'prep' | 'demand' | 'inventory';
  title: string;
  description: string;
  actionText: string;
  theme: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    badgeColor: string;
  };
  applied?: boolean;
}

export default function AIKitchenInsightsView({ onOpenAIModal }: { onOpenAIModal?: () => void }) {
  const [activeShift] = useState('AM Shift · Sunday, July 18, 2026');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Recommendations with interactive action triggers
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([
    {
      id: 'rec-1',
      type: 'workload',
      title: 'Workload Optimization',
      description:
        'Grill Station is overloaded at 92%. Reassigning 2 burger orders to Fry Station (42%) will reduce wait times by an estimated 3.5 minutes.',
      actionText: 'Reassign Orders',
      theme: {
        bg: 'bg-red-500/5',
        border: 'outline-red-500/10 border-red-500/20',
        iconBg: 'bg-red-500/10 text-red-400',
        iconColor: 'text-red-400',
        titleColor: 'text-slate-200',
        badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      },
    },
    {
      id: 'rec-2',
      type: 'prep',
      title: 'Preparation Alert',
      description:
        'Order #10582 must be completed within 3 minutes. Escalate to head chef if no action is taken in the next 60 seconds.',
      actionText: 'Escalate to Chef',
      theme: {
        bg: 'bg-amber-500/5',
        border: 'outline-amber-500/10 border-amber-500/20',
        iconBg: 'bg-amber-500/10 text-yellow-500',
        iconColor: 'text-yellow-500',
        titleColor: 'text-slate-200',
        badgeColor: 'text-yellow-500 bg-amber-500/10 border-amber-500/20',
      },
    },
    {
      id: 'rec-3',
      type: 'demand',
      title: 'Dinner Demand Prediction',
      description:
        'Burger demand +18%, Pizza +12% during 6–8 PM rush. Pre-stage patties, buns, and pizza dough now to avoid bottlenecks.',
      actionText: 'Pre-Stage Prep',
      theme: {
        bg: 'bg-blue-500/5',
        border: 'outline-blue-500/10 border-blue-500/20',
        iconBg: 'bg-blue-500/10 text-blue-400',
        iconColor: 'text-blue-400',
        titleColor: 'text-slate-200',
        badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      },
    },
    {
      id: 'rec-4',
      type: 'inventory',
      title: 'Inventory Risk',
      description:
        'Mozzarella at 16% — insufficient for projected dinner pizza demand. Restock by 5:00 PM to avoid menu 86s.',
      actionText: 'Fast Restock PO',
      theme: {
        bg: 'bg-teal-500/5',
        border: 'outline-teal-500/10 border-teal-500/20',
        iconBg: 'bg-teal-500/10 text-teal-400',
        iconColor: 'text-teal-400',
        titleColor: 'text-slate-200',
        badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      },
    },
  ]);

  // Revenue By Hour / Daily Performance Bar data (Matching user screenshot)
  const barChartData = [
    { day: 'Mon', value: 88, max: 320, orders: 110, revenue: '$880' },
    { day: 'Tue', value: 260, max: 320, orders: 284, revenue: '$2,600' },
    { day: 'Wed', value: 165, max: 320, orders: 195, revenue: '$1,650' },
    { day: 'Thu', value: 65, max: 320, orders: 82, revenue: '$650' },
    { day: 'Fri', value: 195, max: 320, orders: 230, revenue: '$1,950' },
    { day: 'Sat', value: 312, max: 320, orders: 342, revenue: '$3,120', isPeak: true },
    { day: 'Sun', value: 148, max: 320, orders: 172, revenue: '$1,480' },
  ];

  const handleApplyRecommendation = (rec: AIRecommendationItem) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === rec.id ? { ...r, applied: true } : r))
    );
    toast.success(`AI Recommendation Applied: "${rec.title}"`, {
      description: `Target optimization dispatched across active kitchen stations.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & MODEL STATUS BADGES                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter'] flex items-center gap-2.5">
            AI Kitchen Insights
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
            {activeShift}
          </p>
        </div>

        {/* Model and Status Badges */}
        <div className="flex items-center gap-2">
          {/* Badge 1: Model */}
          <div className="px-3 py-1.5 bg-green-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-green-500/20 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-500 text-xs font-normal font-['Consolas'] leading-4">
              Model: Tavonza v2.1
            </span>
          </div>

          {/* Badge 2: LIVE Analysis */}
          <div className="px-3 py-1.5 bg-orange-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-orange-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-orange-500 text-xs font-normal font-['Consolas'] leading-4">
              LIVE Analysis
            </span>
          </div>

          {/* Ask AI Button */}
          {onOpenAIModal && (
            <button
              onClick={onOpenAIModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer ml-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Ask AI</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO COLUMN GRID (Matching Figma Layout)                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ======================================================================= */}
        {/* LEFT COLUMN (7/12): 4 Glowing Metric Cards + Revenue by Hour Bar Chart   */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* --------------------------------------------------------------------- */}
          {/* SECTION A: 4 Glowing Metric Cards (2x2 Grid from Figma)               */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Efficiency Score */}
            <div className="p-4 bg-neutral-900 rounded-md shadow-[0px_0px_2px_0px_rgba(125,125,125,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 hover:border-teal-500/40 transition-all flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-teal-500 text-3xl font-bold font-['JetBrains_Mono'] leading-7">
                  93%
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  +4.2%
                </span>
              </div>
              <div>
                <div className="text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                  Efficiency Score
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">Peak line synchronization</div>
              </div>
            </div>

            {/* Card 2: Prediction Accuracy */}
            <div className="p-4 bg-neutral-900 rounded-md shadow-[0px_0px_2px_0px_rgba(125,125,125,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 hover:border-blue-500/40 transition-all flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-blue-500 text-3xl font-bold font-['JetBrains_Mono'] leading-7">
                  18%
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Adaptive
                </span>
              </div>
              <div>
                <div className="text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                  Prediction Accuracy
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">Machine learning confidence</div>
              </div>
            </div>

            {/* Card 3: Waste Reduction */}
            <div className="p-4 bg-neutral-900 rounded-md shadow-[0px_0px_2px_0px_rgba(125,125,125,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 hover:border-orange-500/40 transition-all flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-orange-500 text-3xl font-bold font-['JetBrains_Mono'] leading-7">
                  18%
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  -$420
                </span>
              </div>
              <div>
                <div className="text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                  Waste Reduction
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">Automated portion control</div>
              </div>
            </div>

            {/* Card 4: Customer Sat. (AI) */}
            <div className="p-4 bg-neutral-900 rounded-md shadow-[0px_0px_2px_0px_rgba(125,125,125,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 hover:border-yellow-500/40 transition-all flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <span className="text-yellow-500 text-3xl font-bold font-['JetBrains_Mono'] leading-7">
                  4.7/5
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  ★ Top
                </span>
              </div>
              <div>
                <div className="text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] leading-4">
                  Customer Sat. (AI)
                </div>
                <div className="text-zinc-500 text-xs mt-0.5">Table dining sentiment</div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION B: Revenue by Hour Bar Chart (1:1 with Screenshot)           */}
          {/* --------------------------------------------------------------------- */}
          <div className="p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-white/5 flex flex-col justify-between">
            {/* Chart Title */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-white text-lg font-semibold font-['Inter'] leading-6">
                  Revenue by Hour
                </h2>
                <p className="text-neutral-400 text-sm font-normal font-['Inter'] mt-0.5">
                  Today&apos;s performance timeline
                </p>
              </div>

              {hoveredBar !== null && barChartData[hoveredBar] && (
                <div className="text-sm bg-zinc-800/90 border border-zinc-700/60 px-2.5 py-1 rounded-md text-amber-400 font-mono animate-in fade-in duration-150">
                  {barChartData[hoveredBar].day}: {barChartData[hoveredBar].revenue} · {barChartData[hoveredBar].orders} orders
                </div>
              )}
            </div>

            {/* Bar Chart Container */}
            <div className="w-full pt-4">
              <div className="relative h-48 flex items-end">
                {/* Y-Axis Labels and Dotted Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                  {[320, 240, 160, 80, 0].map((val) => (
                    <div key={val} className="w-full flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-500 w-7 text-right">
                        {val}
                      </span>
                      <div className="flex-1 border-b border-zinc-800/50 border-dashed" />
                    </div>
                  ))}
                </div>

                {/* Bars Grid */}
                <div className="w-full h-full pl-10 pb-7 flex items-end justify-between gap-3 sm:gap-6 z-10">
                  {barChartData.map((item, index) => {
                    const heightPercent = Math.round((item.value / item.max) * 100);

                    return (
                      <div
                        key={item.day}
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                      >
                        {/* The Amber Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[42px] bg-yellow-500 rounded-t-[5px] transition-all duration-200 group-hover:bg-amber-400 group-hover:scale-y-105 origin-bottom shadow-lg ${
                            item.isPeak ? 'shadow-amber-500/20' : ''
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis Day Labels */}
              <div className="w-full pl-10 flex justify-between gap-3 sm:gap-6 pt-1 text-center">
                {barChartData.map((item) => (
                  <div
                    key={item.day}
                    className="flex-1 text-sm font-normal font-['Inter'] text-zinc-300 group-hover:text-amber-400"
                  >
                    {item.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN (5/12): AI Recommendations Card (4 Actionable Cards)      */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 bg-neutral-900 rounded-[10px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.40)] outline outline-1 outline-offset-[-1px] outline-white/5 flex flex-col justify-start items-start">
            {/* Recommendations Header */}
            <div className="w-full pb-3 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-slate-200 text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5 flex items-center gap-2">
                  AI Recommendations
                </h2>
                <p className="text-slate-500 text-sm font-normal font-['Plus_Jakarta_Sans'] mt-0.5">
                  Actionable insights for this shift
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                4 Active
              </span>
            </div>

            {/* 4 Actionable Insight Cards */}
            <div className="w-full pt-3.5 space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 ${rec.theme.bg} rounded-lg outline outline-1 outline-offset-[-1px] ${rec.theme.border} flex flex-col justify-between transition-all hover:bg-white/[0.04]`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Box */}
                    <div
                      className={`w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 ${rec.theme.iconBg}`}
                    >
                      {rec.type === 'workload' ? (
                        <Flame className="w-4 h-4" />
                      ) : rec.type === 'prep' ? (
                        <Clock className="w-4 h-4" />
                      ) : rec.type === 'demand' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-slate-200 text-sm font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                          {rec.title}
                        </h3>
                        {rec.applied && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Applied
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-relaxed mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!rec.applied && (
                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={() => handleApplyRecommendation(rec)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 text-sm font-medium rounded-md border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{rec.actionText}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
