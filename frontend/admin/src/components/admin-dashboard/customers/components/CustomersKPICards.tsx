'use client';

import React from 'react';
import { Users, Crown, DollarSign, Calendar } from 'lucide-react';
import { CustomersKPIs } from '../types';

export interface CustomersKPICardsProps {
  kpis: CustomersKPIs;
}

export default function CustomersKPICards({ kpis }: CustomersKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Total Customers */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.totalCustomers < 10 ? `0${kpis.totalCustomers}` : kpis.totalCustomers}
          </div>
          <div className="text-white text-sm font-semibold font-['Inter'] leading-4">
            Total Customers
          </div>
        </div>
        <div className="size-9 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-yellow-500">
          <Users className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>

      {/* 2. VIP Members */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.vipMembers < 10 ? `0${kpis.vipMembers}` : kpis.vipMembers}
          </div>
          <div className="text-white text-sm font-semibold font-['Inter'] leading-4">
            VIP Members
          </div>
        </div>
        <div className="size-9 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-yellow-500">
          <Crown className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>

      {/* 3. Avg Spend */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-5">
            ${kpis.avgSpend}
          </div>
          <div className="text-white text-sm font-semibold font-['Inter'] leading-4">
            Avg Spend
          </div>
        </div>
        <div className="size-9 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-yellow-500">
          <DollarSign className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>

      {/* 4. Visits Today */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,0.70)] border border-white/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {kpis.visitsToday}
          </div>
          <div className="text-white text-sm font-semibold font-['Inter'] leading-4">
            Visits Today
          </div>
        </div>
        <div className="size-9 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-yellow-500">
          <Calendar className="w-4 h-4 stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
