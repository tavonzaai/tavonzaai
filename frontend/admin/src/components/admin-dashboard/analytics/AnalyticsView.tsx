'use client';

import React, { useState } from 'react';
import {
  AnalyticsHeader,
  AnalyticsKPICards,
  RevenueOverviewChart,
  CategorySplitChart,
  HourlyTrafficChart,
  TopServersCard,
  CustomersVsOrdersChart,
} from './components';
import {
  TIMEFRAME_ANALYTICS_KPIS,
  DAILY_REVENUE_DATA,
  CATEGORY_SPLIT_DATA,
  HOURLY_TRAFFIC_DATA,
  TOP_SERVERS_DATA,
  CUSTOMERS_VS_ORDERS_DATA,
} from './analyticsData';
import { AnalyticsTimeframe } from './types';

export default function AnalyticsView() {
  const [activeTimeframe, setActiveTimeframe] = useState<AnalyticsTimeframe>('This Week');

  const currentKPIs = TIMEFRAME_ANALYTICS_KPIS[activeTimeframe];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Timeframe Toggle */}
      <AnalyticsHeader
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
      />

      {/* 2. 4 Outlined KPI Metric Cards */}
      <AnalyticsKPICards kpis={currentKPIs} />

      {/* 3. Row 1: Daily Revenue Overview (Left) & Category Split Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 flex">
          <RevenueOverviewChart data={DAILY_REVENUE_DATA} />
        </div>
        <div className="lg:col-span-4 flex">
          <CategorySplitChart categories={CATEGORY_SPLIT_DATA} />
        </div>
      </div>

      {/* 4. Row 2: Hourly Traffic (Left) & Top Servers Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 flex">
          <HourlyTrafficChart data={HOURLY_TRAFFIC_DATA} />
        </div>
        <div className="lg:col-span-4 flex">
          <TopServersCard servers={TOP_SERVERS_DATA} />
        </div>
      </div>

      {/* 5. Row 3: Customers vs Orders Full Width Chart */}
      <div className="w-full">
        <CustomersVsOrdersChart data={CUSTOMERS_VS_ORDERS_DATA} />
      </div>
    </div>
  );
}
