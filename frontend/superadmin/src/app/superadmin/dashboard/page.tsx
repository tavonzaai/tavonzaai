'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { StatCards } from '@/components/dashboard/StatCards';
import { MrrChart } from '@/components/dashboard/MrrChart';
import { PastDueAccounts } from '@/components/dashboard/PastDueAccounts';
import { RecentSignupsTable } from '@/components/dashboard/RecentSignupsTable';
import {
  useGetSuperAdminMetricsQuery,
  useGetMrrTrendQuery,
  useGetPastDueAccountsQuery,
  useGetRecentSignupsQuery,
  DEFAULT_METRICS,
  DEFAULT_MRR_TREND,
  DEFAULT_PAST_DUE,
  DEFAULT_RECENT_SIGNUPS,
} from '@/redux/features/superadminApi';
import { useAppSelector } from '@/redux/store';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Alex';

  const {
    data: metrics = DEFAULT_METRICS,
    refetch: refetchMetrics,
    isFetching: isFetchingMetrics,
  } = useGetSuperAdminMetricsQuery();

  const {
    data: mrrTrend = DEFAULT_MRR_TREND,
    refetch: refetchMrr,
  } = useGetMrrTrendQuery();

  const {
    data: pastDue = DEFAULT_PAST_DUE,
    refetch: refetchPastDue,
  } = useGetPastDueAccountsQuery();

  const {
    data: signups = DEFAULT_RECENT_SIGNUPS,
    refetch: refetchSignups,
  } = useGetRecentSignupsQuery();

  const handleRefresh = async () => {
    toast.promise(
      Promise.all([refetchMetrics(), refetchMrr(), refetchPastDue(), refetchSignups()]),
      {
        loading: 'Syncing real-time platform metrics...',
        success: 'Platform metrics updated successfully',
        error: 'Failed to update metrics',
      }
    );
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-7 w-full animate-fade-in font-inter text-white">
        {/* Top Greeting matching Figma */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-semibold leading-9">
              Good morning, {firstName}
            </h1>
            <p className="text-zinc-500 text-sm font-normal leading-6 pt-1">
              Here’s what’s happening across the platform today.
            </p>
          </div>

          {/* Quick Action Bar */}
          {/* <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingMetrics ? 'animate-spin text-amber-400' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => toast.success('Platform executive report downloaded (PDF/CSV).')}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => router.push('/superadmin/tenants?openModal=true')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-yellow-500/10 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Tenant</span>
            </button>
          </div> */}
        </div>

        {/* 1. Stat Cards Row matching Figma */}
        <div>
          <StatCards metrics={metrics} />
        </div>

        {/* 2. MRR Trend & Past-Due Accounts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2 flex">
            <MrrChart data={mrrTrend} />
          </div>
          <div className="lg:col-span-1 flex">
            <PastDueAccounts accounts={pastDue} />
          </div>
        </div>

        {/* 3. Recent Signups Table Row matching Figma */}
        <div>
          <RecentSignupsTable signups={signups} />
        </div>
      </div>
    </SuperAdminLayout>
  );
}
