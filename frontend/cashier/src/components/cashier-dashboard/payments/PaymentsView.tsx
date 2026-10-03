'use client';

import React, { useState } from 'react';
import {
  PaymentStatCards,
  HourlyRevenueChart,
  PaymentMethodBreakdownCard,
  ProcessPaymentCard,
} from './components';
import {
  INITIAL_PAYMENT_STATS,
  HOURLY_REVENUE_DATA,
  PAYMENT_METHOD_BREAKDOWN,
} from './paymentsData';
import { PaymentStatItem } from './types';

export default function PaymentsView() {
  const [stats, setStats] = useState<PaymentStatItem[]>(INITIAL_PAYMENT_STATS);

  const handleProcessSuccess = (_orderRef: string, amount: number) => {
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'today-revenue') {
          const current = parseFloat(s.value.replace(/[^0-9.]/g, '')) || 9860;
          const nextVal = current + amount;
          return {
            ...s,
            value: `$${nextVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
            subtitle: '249 transactions',
          };
        }
        return s;
      })
    );
  };

  const handleRefundSuccess = (_orderRef: string, amount: number) => {
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'refunds-today') {
          const current = parseFloat(s.value.replace(/[^0-9.]/g, '')) || 18.5;
          const nextVal = current + amount;
          return {
            ...s,
            value: `$${nextVal.toFixed(2)}`,
            subtitle: '2 transactions',
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="w-full space-y-7 font-['Inter'] pb-12 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] leading-tight">
          Payments
        </h1>
        <p className="text-slate-500 text-base sm:text-lg font-normal font-['Inter']">
          Process and manage payment transactions
        </p>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <PaymentStatCards stats={stats} />

      {/* 3. Hourly Revenue Chart */}
      <HourlyRevenueChart data={HOURLY_REVENUE_DATA} />

      {/* 4. Bottom Grid: Breakdown (Left) & Process Payment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <PaymentMethodBreakdownCard breakdown={PAYMENT_METHOD_BREAKDOWN} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <ProcessPaymentCard
            onProcessSuccess={handleProcessSuccess}
            onRefundSuccess={handleRefundSuccess}
          />
        </div>
      </div>
    </div>
  );
}
