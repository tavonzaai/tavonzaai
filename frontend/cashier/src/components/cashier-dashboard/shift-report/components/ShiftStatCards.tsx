'use client';

import React from 'react';
import { ShiftStats } from '../types';

interface ShiftStatCardsProps {
  stats: ShiftStats;
}

export const ShiftStatCards: React.FC<ShiftStatCardsProps> = ({ stats }) => {
  const row1 = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      color: 'text-teal-500',
    },
    {
      label: 'Transactions',
      value: stats.transactionsCount.toString(),
      color: 'text-blue-500',
    },
    {
      label: 'Avg Spend',
      value: `$${stats.avgSpend.toFixed(2)}`,
      color: 'text-violet-500',
    },
    {
      label: 'Cashier Hours',
      value: stats.cashierHours,
      color: 'text-white',
    },
  ];

  const row2 = [
    {
      label: 'Cash Collected',
      value: `$${stats.cashCollected.toLocaleString()}`,
      color: 'text-teal-500',
    },
    {
      label: 'Card Payments',
      value: `$${stats.cardPayments.toLocaleString()}`,
      color: 'text-blue-500',
    },
    {
      label: 'QR Payments',
      value: `$${stats.qrPayments.toFixed(2)}`,
      color: 'text-violet-500',
    },
    {
      label: 'Visits Today',
      value: `$${stats.visitsToday.toFixed(2)}`,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row1.map((item) => (
          <div
            key={item.label}
            className="h-20 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(125,125,125,0.4)] border border-white/5 px-5 py-4 flex flex-col justify-center transition-all hover:border-white/15"
          >
            <div
              className={`text-2xl font-bold font-['Inter'] leading-6 ${item.color}`}
            >
              {item.value}
            </div>
            <div className="text-white text-sm font-semibold font-['Inter'] leading-5 mt-0.5 truncate">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row2.map((item) => (
          <div
            key={item.label}
            className="h-20 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(125,125,125,0.4)] border border-white/5 px-5 py-4 flex flex-col justify-center transition-all hover:border-white/15"
          >
            <div
              className={`text-2xl font-bold font-['Inter'] leading-6 ${item.color}`}
            >
              {item.value}
            </div>
            <div className="text-white text-sm font-semibold font-['Inter'] leading-5 mt-0.5 truncate">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
