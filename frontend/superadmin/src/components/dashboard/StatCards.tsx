'use client';

import React from 'react';
import { SuperAdminMetrics } from '@/redux/features/superadminApi';
import { formatCurrency } from '@/lib/utils';

interface StatCardsProps {
  metrics: SuperAdminMetrics;
}

export function StatCards({ metrics }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Active Tenants */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all group">
        <div className="flex justify-between items-center w-full">
          <span className="text-white text-base font-semibold font-inter leading-6">
            Active Tenants
          </span>
          <div className="size-8 min-w-8 bg-yellow-500/10 rounded-lg flex justify-center items-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-400 text-base font-semibold font-inter leading-6">
              ↗
            </span>
          </div>
        </div>

        <div className="pt-5 flex flex-col justify-start items-start w-full">
          <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
            <span className="text-white text-2xl font-medium font-inter leading-9">
              {metrics.activeTenants}
            </span>
          </div>
        </div>

        <div className="h-6 pt-2 flex flex-col justify-start items-start">
          <span className="text-green-500 text-xs font-normal font-inter leading-4">
            {metrics.activeTenantsGrowth}
          </span>
        </div>
      </div>

      {/* 2. MRR */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all group">
        <div className="flex justify-between items-center w-full">
          <span className="text-white text-base font-semibold font-inter leading-6">
            MRR
          </span>
          <div className="size-8 min-w-8 bg-yellow-500/10 rounded-lg flex justify-center items-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-400 text-base font-semibold font-inter leading-6">
              $
            </span>
          </div>
        </div>

        <div className="pt-5 flex flex-col justify-start items-start w-full">
          <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
            <span className="text-white text-2xl font-medium font-inter leading-9">
              {formatCurrency(metrics.mrr)}
            </span>
          </div>
        </div>

        <div className="h-6 pt-2 flex flex-col justify-start items-start">
          <span className="text-green-500 text-xs font-normal font-inter leading-4">
            {metrics.mrrGrowth}
          </span>
        </div>
      </div>

      {/* 3. New Signups */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all group">
        <div className="flex justify-between items-center w-full">
          <span className="text-white text-base font-semibold font-inter leading-6">
            New Signups
          </span>
          <div className="size-8 min-w-8 bg-yellow-500/10 rounded-lg flex justify-center items-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-400 text-base font-semibold font-inter leading-6">
              +
            </span>
          </div>
        </div>

        <div className="pt-5 flex flex-col justify-start items-start w-full">
          <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
            <span className="text-white text-2xl font-medium font-inter leading-9">
              {metrics.newSignups}
            </span>
          </div>
        </div>

        <div className="h-6 pt-2 flex flex-col justify-start items-start">
          <span className="text-green-500 text-xs font-normal font-inter leading-4">
            {metrics.newSignupsPeriod}
          </span>
        </div>
      </div>

      {/* 4. Past-Due Accounts (Highlight outline in red-400/30) */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-red-400/30 flex flex-col justify-between hover:outline-red-400/50 transition-all group">
        <div className="flex justify-between items-center w-full">
          <span className="text-white text-base font-semibold font-inter leading-6">
            Past-Due Accounts
          </span>
          <div className="size-8 min-w-8 bg-yellow-500/10 rounded-lg flex justify-center items-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-400 text-base font-semibold font-inter leading-6">
              !
            </span>
          </div>
        </div>

        <div className="pt-5 flex flex-col justify-start items-start w-full">
          <div className="w-full pt-4 border-t border-zinc-800 flex flex-col justify-start items-start">
            <span className="text-white text-2xl font-medium font-inter leading-9">
              {metrics.pastDueAccountsCount}
            </span>
          </div>
        </div>

        <div className="h-6 pt-2 flex flex-col justify-start items-start">
          <span className="text-red-400 text-xs font-normal font-inter leading-4">
            ${metrics.pastDueOutstandingAmount} outstanding
          </span>
        </div>
      </div>
    </div>
  );
}
