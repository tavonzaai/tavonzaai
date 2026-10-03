'use client';

import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { FinanceKPIs, TimeframeFilter } from '../types';

export interface FinanceKPICardsProps {
  kpis: FinanceKPIs;
  timeframe: TimeframeFilter;
}

export default function FinanceKPICards({
  kpis,
  timeframe,
}: FinanceKPICardsProps) {
  const timeframePrefix =
    timeframe === 'Week'
      ? 'Weekly'
      : timeframe === 'Month'
      ? 'Monthly'
      : timeframe === 'Quarter'
      ? 'Quarterly'
      : 'Annual';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Revenue */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.revenue.toLocaleString()}
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            {timeframePrefix} Revenue
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            +{kpis.revenueChange}%
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 2. Expenses */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.expenses.toLocaleString()}
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            {timeframePrefix} Expenses
          </div>
          <div className="text-orange-500 text-xs font-medium font-['Inter'] leading-4">
            +{kpis.expensesChange}%
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 3. Net Profit */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.netProfit.toLocaleString()}
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            Net Profit
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            +{kpis.netProfitChange}%
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 4. Profit Margin */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.profitMargin}%
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            Profit Margin
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            +{kpis.marginChangePp}pp
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <Percent className="w-4 h-4 text-orange-500" />
        </div>
      </div>
    </div>
  );
}
