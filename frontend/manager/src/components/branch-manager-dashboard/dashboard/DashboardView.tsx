'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Package,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { branchManagerService, getActiveBranchId, LiveOrderItem, TableItem } from '../../../redux/features/branchManagerApi';

interface DashboardViewProps {
  onNavigateToTables: (filter?: string) => void;
  onSelectTable: (tableId: string) => void;
}

export default function DashboardView({
  onNavigateToTables,
  onSelectTable,
}: DashboardViewProps) {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<LiveOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const branchId = getActiveBranchId();
        const [apiTables, apiOrders] = await Promise.all([
          branchManagerService.getTables(branchId).catch(() => []),
          branchManagerService.getOrders(branchId).catch(() => []),
        ]);
        if (isMounted) {
          setTables(Array.isArray(apiTables) ? apiTables : []);
          setOrders(Array.isArray(apiOrders) ? apiOrders : []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
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
  }, []);

  // Compute live operational metrics from real API data
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.serviceStatus?.toUpperCase() === 'OCCUPIED' || Boolean(t.activeSessionId)).length;
  const availableTables = tables.filter((t) => t.serviceStatus?.toUpperCase() === 'AVAILABLE' || (!t.serviceStatus && !t.activeSessionId)).length;

  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PREPARING'
  );
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING').length;
  const readyOrders = orders.filter((o) => o.status === 'READY_TO_SERVE').length;

  // Delayed orders: placed more than 20 mins ago and not yet served
  const now = Date.now();
  const delayedOrders = orders.filter((o) => {
    if (o.status === 'SERVED' || o.status === 'COMPLETED' || o.status === 'CANCELLED') return false;
    const createdTime = new Date(o.createdAt).getTime();
    return !isNaN(createdTime) && now - createdTime > 20 * 60 * 1000;
  });

  // Payment pending orders
  const paymentPendingOrders = orders.filter(
    (o) => o.paymentStatus === 'UNPAID' || o.paymentStatus === 'PARTIALLY_PAID' || o.status === 'READY_TO_SERVE'
  );
  const totalPaymentPendingAmount = paymentPendingOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  // Dynamic Needs Action items based on real database state
  const needsActionItems: Array<{
    id: string;
    title: string;
    timeHighlight: string | null;
    subtext: string;
    tableId: string | null;
    icon: any;
    iconColor: string;
    iconBg: string;
  }> = [];

  if (paymentPendingOrders.length > 0) {
    const firstPending = paymentPendingOrders[0];
    needsActionItems.push({
      id: 'action-payment',
      title: 'Payment Pending',
      timeHighlight: `$${totalPaymentPendingAmount.toFixed(2)}`,
      subtext: `${paymentPendingOrders.length} order(s) awaiting checkout`,
      tableId: firstPending?.tableId || null,
      icon: ShieldAlert,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10 border-red-500/20',
    });
  }

  if (delayedOrders.length > 0) {
    needsActionItems.push({
      id: 'action-delayed',
      title: 'Kitchen Station Behind',
      timeHighlight: null,
      subtext: `${delayedOrders.length} order(s) delayed >20m`,
      tableId: delayedOrders[0]?.tableId || null,
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10 border-yellow-400/20',
    });
  }

  if (availableTables === 0 && totalTables > 0) {
    needsActionItems.push({
      id: 'action-capacity',
      title: 'Dining Room At Capacity',
      timeHighlight: '100%',
      subtext: '0 walk-in tables available',
      tableId: null,
      icon: AlertCircle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border-amber-400/20',
    });
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl animate-in fade-in duration-200">
      {/* 1. Header & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
            Branch Overview
          </h1>
          <div className="flex items-center gap-2 text-sm font-['Inter']">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-emerald-500 font-medium">Live Connected</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              {totalTables} Registered Tables · {orders.length} Total Orders Today
            </span>
          </div>
        </div>

        {/* Live System Status Banner */}
        <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-white text-sm font-normal font-['Inter']">
            {loading
              ? 'Synchronizing live branch telemetry...'
              : delayedOrders.length > 0
              ? `${delayedOrders.length} order(s) require attention.`
              : 'All kitchen stations operating within target SLAs.'}
          </span>
        </div>
      </div>

      {/* 2. Needs Action Section */}
      <div className="space-y-3.5">
        <h2 className="text-white text-2xl font-medium font-['Inter']">
          Needs Action
        </h2>

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
                  onClick={() => {
                    if (item.tableId) {
                      onSelectTable(item.tableId);
                    } else {
                      onNavigateToTables();
                    }
                  }}
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

      {/* 3. Live Operations Section */}
      <div className="space-y-3.5">
        <h2 className="text-white text-2xl font-medium font-['Inter']">
          Live Operations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Active Tables Card */}
          <div
            onClick={() => onNavigateToTables('all')}
            className="p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col justify-between gap-3 cursor-pointer transition shadow-sm group"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-neutral-400 text-sm font-medium font-['Inter']">
                Active Tables
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-semibold font-['Inter']">
                  {totalTables}
                </span>
                <span className="text-emerald-500 text-base font-medium font-['Inter']">
                  {occupiedTables} occupied
                </span>
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              {availableTables} table(s) available for walk-ins
            </span>
          </div>

          {/* Pending Orders Card */}
          <div
            onClick={() => onNavigateToTables('preparing')}
            className="p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col justify-between gap-3 cursor-pointer transition shadow-sm group"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-neutral-400 text-sm font-medium font-['Inter']">
                Active Kitchen Orders
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-semibold font-['Inter']">
                  {pendingOrders.length}
                </span>
                {delayedOrders.length > 0 ? (
                  <span className="text-yellow-400 text-base font-medium font-['Inter']">
                    {delayedOrders.length} Delayed
                  </span>
                ) : (
                  <span className="text-emerald-400 text-base font-medium font-['Inter']">
                    On Schedule
                  </span>
                )}
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              {preparingOrders} preparing · {readyOrders} ready to serve
            </span>
          </div>

          {/* Payment Pending Card */}
          <div
            onClick={() => onNavigateToTables('payment')}
            className="p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col justify-between gap-3 cursor-pointer transition shadow-sm group"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-neutral-400 text-sm font-medium font-['Inter']">
                Payment Pending
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-semibold font-['Inter']">
                  {String(paymentPendingOrders.length).padStart(2, '0')}
                </span>
                <span className="text-white text-base font-medium font-['Inter']">
                  ${totalPaymentPendingAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              {paymentPendingOrders.length > 0
                ? paymentPendingOrders.slice(0, 3).map((o) => o.tableNumber || o.orderNumber).join(', ')
                : 'No pending guest balances'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
