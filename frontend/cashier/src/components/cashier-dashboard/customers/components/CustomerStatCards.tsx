'use client';

import React from 'react';
import { CustomerStats } from '../types';

interface CustomerStatCardsProps {
  stats: CustomerStats;
}

export default function CustomerStatCards({ stats }: CustomerStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
      {/* 1. Total Customers */}
      <div className="h-20 bg-neutral-900 rounded-[10px] border border-white/10 p-5 flex flex-col justify-center shadow-sm">
        <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-tight">
          {stats.totalCustomers}
        </div>
        <div className="text-white text-sm font-semibold font-['Inter'] leading-tight mt-1.5">
          Total Customers
        </div>
      </div>

      {/* 2. Gold Members */}
      <div className="h-20 bg-neutral-900 rounded-[10px] border border-white/10 p-5 flex flex-col justify-center shadow-sm">
        <div className="text-amber-500 text-2xl font-bold font-['Inter'] leading-tight">
          {stats.goldMembers}
        </div>
        <div className="text-white text-sm font-semibold font-['Inter'] leading-tight mt-1.5">
          Gold Members
        </div>
      </div>

      {/* 3. Avg Lifetime Value */}
      <div className="h-20 bg-neutral-900 rounded-[10px] border border-white/10 p-5 flex flex-col justify-center shadow-sm">
        <div className="text-blue-500 text-2xl font-bold font-['Inter'] leading-tight">
          ${stats.avgLifetimeValue.toLocaleString()}
        </div>
        <div className="text-white text-sm font-semibold font-['Inter'] leading-tight mt-1.5">
          Avg Lifetime Value
        </div>
      </div>
    </div>
  );
}
