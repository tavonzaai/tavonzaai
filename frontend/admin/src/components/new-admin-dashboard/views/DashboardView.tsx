'use client';

import React, { useMemo } from 'react';
import {
  Store,
  GitBranch,
  Users,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useGetAnalyticsOverviewQuery } from '@/redux/features/adminApi';
import { AdminNavTab } from '../types';

interface DashboardViewProps {
  onNavigateTab?: (tab: AdminNavTab) => void;
}

export default function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const { user } = useAppSelector((state) => state.auth);
  const organizationId = useOrganizationId();
  const { data: overview, isLoading } = useGetAnalyticsOverviewQuery(
    { organizationId: organizationId || undefined },
    { skip: !organizationId },
  );

  const rawName = user?.name || 'there';
  const firstName = rawName.split(' ')[0] || 'there';
  const healthRows = useMemo(
    () => [
      { name: 'Occupancy', value: overview ? `${overview.occupancyPercent ?? 0}%` : '—' },
      { name: 'Pending orders', value: overview ? String(overview.pendingOrders ?? 0) : '—' },
      { name: 'Active staff', value: overview ? String(overview.staffCount ?? 0) : '—' },
      { name: 'Tables', value: overview ? String(overview.tablesCount ?? 0) : '—' },
    ],
    [overview],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-semibold font-sans tracking-tight leading-9">
            Good morning, {firstName}
          </h1>
          <p className="text-zinc-500 text-base font-normal font-sans leading-6 mt-1">
            Here’s what’s happening across Tavonza Group today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
            <Sparkles className="size-3.5" />
            AI Co-Pilot Active
          </span>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Total Restaurants */}
        <div
          onClick={() => onNavigateTab?.('restaurants')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Restaurants
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Store className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              {overview?.restaurantsCount ?? '—'}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-sm font-normal font-sans leading-4">
                Live organization total
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Branches */}
        <div
          onClick={() => onNavigateTab?.('branches')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Branches
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <GitBranch className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              {overview?.branchesCount ?? '—'}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-sm font-normal font-sans leading-4">
                Across {overview?.restaurantsCount ?? 0} restaurants
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Staff */}
        <div
          onClick={() => onNavigateTab?.('permissions')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Total Staff
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Users className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              {overview?.staffCount ?? '—'}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-sm font-normal font-sans leading-4">
                Active branch assignments
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div
          onClick={() => onNavigateTab?.('payments')}
          className="p-5 bg-neutral-900 hover:bg-neutral-900/90 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:border-yellow-500/40 cursor-pointer shadow-lg group"
        >
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-sans">
              Revenue
            </span>
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <DollarSign className="size-4 text-yellow-500" />
            </div>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          <div className="flex flex-col gap-2">
            <div className="text-white text-3xl font-medium font-sans leading-8 tracking-tight">
              {typeof overview?.paidRevenue === 'number'
                ? `$${overview.paidRevenue.toLocaleString()}`
                : '—'}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-sm font-normal font-sans leading-4">
                Paid customer orders
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 p-6 lg:p-7 bg-[#121316] rounded-2xl border border-neutral-800/80 flex flex-col justify-center min-h-64 shadow-xl">
          <h2 className="text-white text-xl sm:text-2xl font-bold font-sans tracking-tight">
            Revenue
          </h2>
          <p className="text-neutral-400 text-sm font-sans mt-1">
            Paid customer order totals from the analytics API. A timeseries endpoint is not available, so no chart is invented.
          </p>
          <div className="mt-8 text-white text-4xl font-semibold" data-testid="dashboard-paid-revenue">
            {isLoading
              ? 'Loading...'
              : typeof overview?.paidRevenue === 'number'
                ? `$${overview.paidRevenue.toLocaleString()}`
                : '—'}
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 p-6 bg-[#121316] rounded-2xl border border-neutral-800/80 flex flex-col gap-5 shadow-xl">
          <h2 className="text-white text-base sm:text-lg font-semibold font-sans">
            Live operations
          </h2>
          <div className="space-y-3.5">
            {healthRows.map((metric) => (
              <div key={metric.name} className="flex justify-between items-center text-sm font-sans">
                <span className="text-neutral-400">{metric.name}</span>
                <span className="text-white font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
