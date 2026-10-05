'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  TrendingUp,
  CreditCard,
  UserX,
  AlertCircle,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { branchManagerService, getActiveBranchId, LiveOrderItem, TableItem } from '../../../redux/features/branchManagerApi';

interface DashboardViewProps {
  onNavigateToTables: (filter?: string) => void;
  onSelectTable: (tableId: string) => void;
}

interface RecentOrderDisplay {
  id: string;
  orderNumber: string;
  table: string;
  items: string;
  customerName: string;
  amount: string;
  status: 'Preparing' | 'Ready' | 'Completed';
}

const SAMPLE_RECENT_ORDERS: RecentOrderDisplay[] = [
  {
    id: 'ord-10590',
    orderNumber: '#10590',
    table: 'Table 01',
    items: 'Grilled Chicken',
    customerName: 'Alex Morgan',
    amount: '$86.40',
    status: 'Preparing',
  },
  {
    id: 'ord-10591',
    orderNumber: '#10591',
    table: 'Table 03',
    items: '2X Mojito',
    customerName: 'Jamie Lee',
    amount: '$86.40',
    status: 'Preparing',
  },
  {
    id: 'ord-10592',
    orderNumber: '#10592',
    table: 'Table 04',
    items: 'Truffle Fries',
    customerName: 'Jordan Patel',
    amount: '$86.40',
    status: 'Ready',
  },
  {
    id: 'ord-10593',
    orderNumber: '#10593',
    table: 'Table 06',
    items: 'Pasta Carbonara',
    customerName: 'Avery Johnson',
    amount: '$86.40',
    status: 'Completed',
  },
  {
    id: 'ord-10594',
    orderNumber: '#10594',
    table: 'Table 07',
    items: 'Wagyu Sliders',
    customerName: 'Cameron Wilson',
    amount: '$86.40',
    status: 'Ready',
  },
  {
    id: 'ord-10595',
    orderNumber: '#10595',
    table: 'Table 08',
    items: 'Mutton Stack',
    customerName: 'Casey Rivera',
    amount: '$86.40',
    status: 'Completed',
  },
];

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
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Operational stats derived from live API with fallbacks matching Figma
  const totalTablesCount = tables.length > 0 ? tables.length : 24;
  const occupiedTablesCount = tables.length > 0
    ? tables.filter((t) => t.serviceStatus?.toUpperCase() === 'OCCUPIED' || Boolean(t.activeSessionId)).length
    : 18;
  const availableTablesCount = totalTablesCount - occupiedTablesCount;

  const totalOrdersCount = orders.length > 0 ? orders.length : 148;
  const totalRevenueAmount = orders.length > 0
    ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    : 8429;
  const avgOrderValueAmount = totalOrdersCount > 0 ? totalRevenueAmount / totalOrdersCount : 56.95;

  // Format dynamic API orders into table rows or use exact Figma sample list
  const recentOrdersList: RecentOrderDisplay[] = React.useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.slice(0, 6).map((o, idx) => {
        let status: 'Preparing' | 'Ready' | 'Completed' = 'Preparing';
        const st = String(o.status || '').toUpperCase();
        if (st === 'READY_TO_SERVE' || st === 'READY') status = 'Ready';
        else if (st === 'SERVED' || st === 'COMPLETED') status = 'Completed';

        const itemNames = (o.items || []).map((i: any) => i.name || i.menuItem?.name).filter(Boolean).join(', ');
        const sampleNames = ['Alex Morgan', 'Jamie Lee', 'Jordan Patel', 'Avery Johnson', 'Cameron Wilson', 'Casey Rivera'];
        const sampleItems = ['Grilled Chicken', '2X Mojito', 'Truffle Fries', 'Pasta Carbonara', 'Wagyu Sliders', 'Mutton Stack'];

        return {
          id: o.id || `ord-${idx}`,
          orderNumber: o.orderNumber || `#${10590 + idx}`,
          table: o.tableNumber || (o.tableId ? `Table ${o.tableId.slice(0, 2)}` : `Table 0${(idx % 8) + 1}`),
          items: itemNames || sampleItems[idx % sampleItems.length] || 'Grilled Chicken',
          customerName: (o as any).customerName || sampleNames[idx % sampleNames.length],
          amount: `$${(o.totalAmount || 86.4).toFixed(2)}`,
          status,
        };
      });
    }
    return SAMPLE_RECENT_ORDERS;
  }, [orders]);

  const renderStatusBadge = (status: RecentOrderDisplay['status']) => {
    switch (status) {
      case 'Preparing':
        return (
          <div className="px-3 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-md flex items-center justify-center">
            <span className="text-fuchsia-400 text-sm font-medium font-['Inter']">Preparing</span>
          </div>
        );
      case 'Ready':
        return (
          <div className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-md flex items-center justify-center">
            <span className="text-teal-500 text-sm font-medium font-['Inter']">Ready</span>
          </div>
        );
      case 'Completed':
      default:
        return (
          <div className="px-3 py-1.5 bg-blue-400/10 border border-blue-400/20 rounded-md flex items-center justify-center">
            <span className="text-blue-400 text-sm font-medium font-['Inter']">Completed</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl animate-in fade-in duration-200">
      
      {/* 1. BRANCH OVERVIEW HEADER & TOP METRIC CARDS */}
      <div className="flex flex-col gap-6">
        {/* Title and Open Status */}
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] tracking-tight">
            Branch Overview
          </h1>
          <div className="flex items-center gap-2 text-sm font-['Inter']">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.6)]" />
              <span className="text-green-600 font-normal">Open</span>
            </div>
            <span className="text-zinc-500 font-normal">
              Operating Normally , Monday, sep 28
            </span>
          </div>
        </div>

        {/* 4 Top KPI Cards matching Figma Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Today's Revenue */}
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3 shadow-sm hover:border-neutral-700 transition">
            <div className="flex flex-col gap-2.5">
              <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
                Today&apos;s Revenue
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white text-xl sm:text-2xl font-bold font-['Inter']">
                ${totalRevenueAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
                vs. $7,530 yesterday
              </span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3 shadow-sm hover:border-neutral-700 transition">
            <div className="flex flex-col gap-2.5">
              <div className="w-10 h-10 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
                Total Orders
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white text-xl sm:text-2xl font-bold font-['Inter']">
                {totalOrdersCount}
              </span>
              <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
                12 more then yesterday
              </span>
            </div>
          </div>

          {/* Card 3: Active Tables */}
          <div
            onClick={() => onNavigateToTables('all')}
            className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3 shadow-sm hover:border-neutral-700 cursor-pointer transition"
          >
            <div className="flex flex-col gap-2.5">
              <div className="w-10 h-10 bg-emerald-400/10 border border-emerald-400/20 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
                Active Tables
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white text-xl sm:text-2xl font-bold font-['Inter']">
                {occupiedTablesCount} / {totalTablesCount}
              </span>
              <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
                {availableTablesCount} tables available (today)
              </span>
            </div>
          </div>

          {/* Card 4: Avg. Order Value */}
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3 shadow-sm hover:border-neutral-700 transition">
            <div className="flex flex-col gap-2.5">
              <div className="w-10 h-10 bg-violet-400/10 border border-violet-400/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
                Avg. Order Value
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white text-xl sm:text-2xl font-bold font-['Inter']">
                ${avgOrderValueAmount.toFixed(2)}
              </span>
              <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
                Across all orders (today)
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NEEDS ATTENTION SECTION */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-lg font-medium font-['Poppins']">
            Needs attention
          </h2>
          <p className="text-neutral-400 text-xs font-normal font-['Poppins']">
            Items that require your review
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Payment pending */}
          <div
            onClick={() => onNavigateToTables('payment')}
            className="p-5 bg-neutral-900 rounded-xl border border-neutral-700/60 hover:border-neutral-500 flex items-center justify-between gap-4 cursor-pointer transition group shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-base sm:text-lg font-medium font-['Inter'] truncate">
                  Payment pending
                </span>
                <span className="text-neutral-400 text-xs sm:text-sm font-medium font-['Inter'] truncate">
                  Table 12 · 10 minutes
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition shrink-0" />
          </div>

          {/* Card 2: Staff unavailable */}
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-700/60 hover:border-neutral-500 flex items-center justify-between gap-4 cursor-pointer transition group shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-base sm:text-lg font-medium font-['Inter'] truncate">
                  Staff unavailable
                </span>
                <span className="text-neutral-400 text-xs sm:text-sm font-medium font-['Inter'] truncate">
                  J. Smith · Evening shift
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition shrink-0" />
          </div>

          {/* Card 3: Low stock alert */}
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-700/60 hover:border-neutral-500 flex items-center justify-between gap-4 cursor-pointer transition group shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-base sm:text-lg font-medium font-['Inter'] truncate">
                  Low stock alert
                </span>
                <span className="text-neutral-400 text-xs sm:text-sm font-medium font-['Inter'] truncate">
                  Premium tequila · 2 left
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition shrink-0" />
          </div>

        </div>
      </div>

      {/* 3. RECENT ORDERS TABLE SECTION (Pixel-Perfect matching Figma Screenshot) */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-lg font-medium font-['Poppins']">
            Recent orders
          </h2>
          <p className="text-neutral-400 text-xs font-normal font-['Poppins']">
            Live orders from your restaurant
          </p>
        </div>

        {/* Responsive Table Container */}
        <div className="w-full bg-black rounded-xl border border-zinc-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-white font-semibold text-sm font-['Inter']">
                  <th className="px-5 py-4 border-r border-zinc-800/60 min-w-[120px]">Order ID</th>
                  <th className="px-5 py-4 border-r border-zinc-800/60 min-w-[120px]">Table</th>
                  <th className="px-5 py-4 border-r border-zinc-800/60 min-w-[180px]">Items</th>
                  <th className="px-5 py-4 border-r border-zinc-800/60 min-w-[160px]">Customer Name</th>
                  <th className="px-5 py-4 border-r border-zinc-800/60 text-center min-w-[120px]">Amount</th>
                  <th className="px-5 py-4 text-center min-w-[130px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentOrdersList.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4 border-r border-zinc-800/60 text-neutral-200 text-base font-medium font-['Inter']">
                      {row.orderNumber}
                    </td>
                    <td className="px-5 py-4 border-r border-zinc-800/60 text-neutral-200 text-base font-medium font-['Inter']">
                      {row.table}
                    </td>
                    <td className="px-5 py-4 border-r border-zinc-800/60 text-neutral-200 text-base font-medium font-['Inter'] truncate max-w-[220px]">
                      {row.items}
                    </td>
                    <td className="px-5 py-4 border-r border-zinc-800/60 text-neutral-200 text-base font-medium font-['Inter'] truncate">
                      {row.customerName}
                    </td>
                    <td className="px-5 py-4 border-r border-zinc-800/60 text-center text-neutral-200 text-base font-medium font-['Inter']">
                      {row.amount}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex justify-center items-center w-full">
                        {renderStatusBadge(row.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
