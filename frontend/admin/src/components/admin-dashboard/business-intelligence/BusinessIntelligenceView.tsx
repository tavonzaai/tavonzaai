'use client';

import React from 'react';
import {
  BIHeader,
  BIPredictiveCards,
  RevenueForecastChart,
  PerformanceRadarChart,
  StrategicActionPlanCard,
} from './components';
import {
  BI_PREDICTIVE_CARDS,
  BI_REVENUE_FORECAST_DATA,
  BI_RADAR_METRICS,
  BI_ACTION_PLAN_ITEMS,
} from './biData';

export default function BusinessIntelligenceView() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with AI Powered badge */}
      <BIHeader />

      {/* 2. 4 Predictive AI Insight Hero Cards */}
      <BIPredictiveCards cards={BI_PREDICTIVE_CARDS} />

      {/* 3. Middle Row: Revenue Forecast (Left) & Performance Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 flex">
          <RevenueForecastChart data={BI_REVENUE_FORECAST_DATA} />
        </div>
        <div className="lg:col-span-4 flex">
          <PerformanceRadarChart metrics={BI_RADAR_METRICS} />
        </div>
      </div>

      {/* 4. Bottom Row: Strategic Action Plan */}
      <div className="w-full">
        <StrategicActionPlanCard items={BI_ACTION_PLAN_ITEMS} />
      </div>
    </div>
  );
}
