'use client';

import React, { useState } from 'react';
import {
  FinanceHeader,
  FinanceKPICards,
  RevenueTrendChart,
  ExpenseBreakdownCard,
  PnLTable,
} from './components';
import {
  TIMEFRAME_KPIS,
  EXPENSE_BREAKDOWN,
  MONTHLY_TRENDS,
  PNL_STATEMENT_ROWS,
} from './financeData';
import { TimeframeFilter } from './types';

export default function FinanceView() {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeFilter>('Month');

  const currentKPIs = TIMEFRAME_KPIS[activeTimeframe];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Timeframe selector */}
      <FinanceHeader
        activeTimeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
      />

      {/* 2. 4 KPI Metric Cards */}
      <FinanceKPICards kpis={currentKPIs} timeframe={activeTimeframe} />

      {/* 3. Charts Row: Revenue Trend (Left) & Expense Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 flex">
          <RevenueTrendChart data={MONTHLY_TRENDS} />
        </div>
        <div className="lg:col-span-4 flex">
          <ExpenseBreakdownCard expenses={EXPENSE_BREAKDOWN} />
        </div>
      </div>

      {/* 4. Profit & Loss Statement Table */}
      <PnLTable rows={PNL_STATEMENT_ROWS} currentMonthName="July 2025" />
    </div>
  );
}
