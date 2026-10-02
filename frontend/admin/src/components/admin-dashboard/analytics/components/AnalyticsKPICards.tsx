'use client';

import React from 'react';
import { DollarSign, ShoppingCart, Clock, Award } from 'lucide-react';
import { AnalyticsKPIs } from '../types';

export interface AnalyticsKPICardsProps {
  kpis: AnalyticsKPIs;
}

export default function AnalyticsKPICards({ kpis }: AnalyticsKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Total Revenue */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-yellow-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-yellow-500 text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <div className="text-neutral-400 text-sm font-semibold font-['Inter'] leading-5">
            Total Revenue
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            ↑ {kpis.revenueChangePercent}%
          </div>
        </div>
        <div className="size-9 bg-orange-500/20 rounded-full flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 2. Avg Order Value */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-blue-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-blue-500 text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.avgOrderValue.toFixed(2)}
          </div>
          <div className="text-neutral-400 text-sm font-semibold font-['Inter'] leading-5">
            Avg Order Value
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            ↑ {kpis.aovChangePercent}%
          </div>
        </div>
        <div className="size-9 bg-blue-500/20 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* 3. Peak Hour */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-green-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-5">
            {kpis.peakHour}
          </div>
          <div className="text-neutral-400 text-sm font-semibold font-['Inter'] leading-5">
            Peak Hour
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            {kpis.peakHourOrders} orders
          </div>
        </div>
        <div className="size-9 bg-green-500/20 rounded-full flex items-center justify-center">
          <Clock className="w-4 h-4 text-green-500" />
        </div>
      </div>

      {/* 4. Top Category */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-purple-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-purple-500 text-2xl font-bold font-['Inter'] leading-5">
            {kpis.topCategoryPercent}% of sales
          </div>
          <div className="text-neutral-400 text-sm font-semibold font-['Inter'] leading-5">
            Top Category
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            {kpis.topCategoryName}
          </div>
        </div>
        <div className="size-9 bg-purple-500/20 rounded-full flex items-center justify-center">
          <Award className="w-4 h-4 text-purple-500" />
        </div>
      </div>
    </div>
  );
}
