'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ChevronRight,
  AlertTriangle,
  Package,
  Sparkles,
  CheckCircle2,
  Building2,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { branchManagerService, getActiveBranchId } from '../../../redux/features/branchManagerApi';
import { useGetMeQuery } from '@/redux/features/authApi';
import { useAppSelector } from '@/redux/hooks';

interface DashboardViewProps {
  onNavigateToTables: (filter?: string) => void;
  onSelectTable: (tableId: string) => void;
}

interface BranchDashboardAnalytics {
  branchId: string;
  tablesCount: number;
  availableTables: number;
  occupiedTables: number;
  occupancyPercent: number;
  staffCount: number;
  ordersCount: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  delayedOrders: number;
  unpaidOrders: number;
  unpaidAmount: number;
  paidRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function DashboardView({
  onNavigateToTables,
}: DashboardViewProps) {
  const { data: user } = useGetMeQuery();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const activeUser = user || reduxUser;
  const branchId = activeUser?.branchId || getActiveBranchId();
  const branchName = activeUser?.branchName || 'Branch Overview';

  const [analytics, setAnalytics] = useState<BranchDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const effectiveBranchId = branchId || getActiveBranchId();
      if (!effectiveBranchId) {
        setError('No active branch selected');
        return;
      }
      const data = await branchManagerService.getBranchDashboardAnalytics(effectiveBranchId);
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load branch analytics:', err);
      setError(err?.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    loadDashboardData().finally(() => {
      if (!isMounted) return;
    });

    const handleUpdate = () => loadDashboardData();
    window.addEventListener('tavonza:table_status_changed', handleUpdate);
    window.addEventListener('tavonza:table_session_changed', handleUpdate);
    window.addEventListener('tavonza:order_created', handleUpdate);
    window.addEventListener('tavonza:order_status_changed', handleUpdate);
    window.addEventListener('tavonza:payment_status_changed', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('tavonza:table_status_changed', handleUpdate);
      window.removeEventListener('tavonza:table_session_changed', handleUpdate);
      window.removeEventListener('tavonza:order_created', handleUpdate);
      window.removeEventListener('tavonza:order_status_changed', handleUpdate);
      window.removeEventListener('tavonza:payment_status_changed', handleUpdate);
    };
  }, [loadDashboardData]);

  const totalTables = analytics?.tablesCount ?? 0;
  const occupiedTables = analytics?.occupiedTables ?? 0;
  const availableTables = analytics?.availableTables ?? 0;
  const pendingOrders = analytics?.pendingOrders ?? 0;
  const preparingOrders = analytics?.preparingOrders ?? 0;
  const readyOrders = analytics?.readyOrders ?? 0;
  const delayedCount = analytics?.delayedOrders ?? 0;
  const unpaidAmount = analytics?.unpaidAmount ?? 0;
  const todayOrders = analytics?.todayOrders ?? 0;
  const todayRevenue = analytics?.todayRevenue ?? 0;
  const staffCount = analytics?.staffCount ?? 0;
  const occupancyPercent = analytics?.occupancyPercent ?? 0;

  const needsActionItems: Array<{
    id: string;
    title: string;
    timeHighlight: string | null;
    subtext: string;
    icon: typeof AlertTriangle;
    iconColor: string;
    iconBg: string;
  }> = [];

  if (delayedCount > 0) {
    needsActionItems.push({
      id: 'delayed',
      title: 'Delayed orders',
      timeHighlight: `${delayedCount} open`,
      subtext: 'Orders past the 20-minute SLA',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border-amber-400/20',
    });
  }
  if (pendingOrders > 0) {
    needsActionItems.push({
      id: 'pending',
      title: 'Pending acceptance',
      timeHighlight: `${pendingOrders} orders`,
      subtext: 'Awaiting waiter or manager review',
      icon: Package,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-400/10 border-sky-400/20',
    });
  }
  if ((analytics?.unpaidOrders ?? 0) > 0) {
    needsActionItems.push({
      id: 'unpaid',
      title: 'Payment pending',
      timeHighlight: `$${unpaidAmount.toFixed(2)}`,
      subtext: `${analytics?.unpaidOrders ?? 0} unpaid order(s)`,
      icon: DollarSign,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-400/10 border-rose-400/20',
    });
  }

  return (
    <div
      className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl animate-in fade-in duration-200"
      data-testid="manager-dashboard-analytics"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
              {branchName} Overview
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>{branchName}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-['Inter']">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-emerald-500 font-medium">Live Connected</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              {totalTables} Tables · {todayOrders} Orders Today · {occupancyPercent}% Occupancy
            </span>
          </div>
        </div>

        <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-white text-sm font-normal font-['Inter']">
            {loading
              ? 'Loading branch analytics...'
              : error
                ? error
                : delayedCount > 0
                  ? `${delayedCount} order(s) require attention.`
                  : 'All kitchen stations operating within target SLAs.'}
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        <h2 className="text-white text-2xl font-medium font-['Inter']">Needs Action</h2>
        {needsActionItems.length === 0 ? (
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center gap-3 text-sm text-neutral-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>No urgent actions required. Floor operations running smoothly.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {needsActionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigateToTables()}
                  className="h-26 p-3 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-neutral-900 group shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${item.iconBg}`}
                    >
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-sm font-medium font-['Inter'] truncate">
                        {item.title}
                      </span>
                      {item.timeHighlight && (
                        <span className="text-white text-sm font-semibold font-['Inter']">
                          {item.timeHighlight}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-normal font-['Inter'] mt-0.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.subtext}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3.5">
        <h2 className="text-white text-2xl font-medium font-['Inter']">Live Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigateToTables('all')}
            className="p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col justify-between gap-3 cursor-pointer transition shadow-sm group"
            data-testid="kpi-active-tables"
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-sm">Active Tables</span>
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-white text-3xl font-semibold">
              {loading ? '—' : `${occupiedTables}/${totalTables}`}
            </div>
            <span className="text-xs text-neutral-500">{availableTables} available</span>
          </div>

          <div
            className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between gap-3 shadow-sm"
            data-testid="kpi-orders"
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-sm">Kitchen Queue</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-white text-3xl font-semibold">
              {loading ? '—' : pendingOrders + preparingOrders + readyOrders}
            </div>
            <span className="text-xs text-neutral-500">
              {pendingOrders} pending · {preparingOrders} prep · {readyOrders} ready
            </span>
          </div>

          <div
            className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between gap-3 shadow-sm"
            data-testid="kpi-revenue"
          >
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-sm">Today Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-white text-3xl font-semibold">
              {loading ? '—' : `$${todayRevenue.toFixed(2)}`}
            </div>
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {staffCount} active staff · {todayOrders} paid orders today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
