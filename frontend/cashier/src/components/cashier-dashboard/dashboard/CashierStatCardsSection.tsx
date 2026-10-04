'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  Clock,
  Timer,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { cashierService, getActiveBranchId } from '@/redux/features/cashierApi';
import { CashierStatCard } from '../types';

export default function CashierStatCardsSection() {
  const [cards, setCards] = useState<CashierStatCard[]>([
    {
      id: 'transactions-today',
      title: 'Transactions Today',
      value: '0',
      subtitle: 'Completed Payments',
      trend: 'Live',
      trendType: 'positive',
      badgeText: 'Live',
      iconName: 'Receipt',
    },
    {
      id: 'revenue-collected',
      title: 'Revenue Collected',
      value: '$0.00',
      subtitle: "Today's Sales",
      trend: 'Live',
      trendType: 'positive',
      badgeText: 'Live',
      iconName: 'DollarSign',
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: '0',
      subtitle: 'Require Attention',
      trend: 'Urgent',
      trendType: 'urgent',
      badgeText: 'Active',
      iconName: 'Clock',
    },
    {
      id: 'avg-checkout-time',
      title: 'Avg Checkout Time',
      value: '45s',
      subtitle: 'Fast Turnaround',
      trend: 'Optimal',
      trendType: 'positive',
      badgeText: 'Normal',
      iconName: 'Timer',
    },
    {
      id: 'refund-requests',
      title: 'Refund Requests',
      value: '0',
      subtitle: 'Pending Approval',
      trend: 'Clear',
      trendType: 'positive',
      badgeText: '0 Open',
      iconName: 'RotateCcw',
    },
    {
      id: 'digital-payments',
      title: 'Digital Payments',
      value: '0%',
      subtitle: 'Card & QR Share',
      trend: 'Live',
      trendType: 'positive',
      badgeText: 'Live',
      iconName: 'Smartphone',
    },
  ]);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const branchId = getActiveBranchId();
        const orders = await cashierService.getOrders(branchId);
        if (mounted && Array.isArray(orders)) {
          const totalCount = orders.length;
          const paidOrders = orders.filter((o: any) => o.paymentStatus === 'PAID');
          const pendingCount = orders.filter((o: any) => o.paymentStatus !== 'PAID').length;
          const totalRevenue = paidOrders.reduce(
            (sum: number, o: any) => sum + (o.totalAmount || o.total || 0),
            0
          );
          const digitalCount = orders.filter(
            (o: any) => o.paymentMethod && o.paymentMethod.toUpperCase() !== 'CASH'
          ).length;
          const digitalPercent = totalCount > 0 ? Math.round((digitalCount / totalCount) * 100) : 0;

          setCards([
            {
              id: 'transactions-today',
              title: 'Transactions Today',
              value: String(totalCount),
              subtitle: `${paidOrders.length} Paid Settlements`,
              trend: 'Live',
              trendType: 'positive',
              badgeText: 'Live',
              iconName: 'Receipt',
            },
            {
              id: 'revenue-collected',
              title: 'Revenue Collected',
              value: `$${totalRevenue.toFixed(2)}`,
              subtitle: "Settled Orders",
              trend: 'Live',
              trendType: 'positive',
              badgeText: 'Settled',
              iconName: 'DollarSign',
            },
            {
              id: 'pending-payments',
              title: 'Pending Payments',
              value: String(pendingCount).padStart(2, '0'),
              subtitle: 'Require Attention',
              trend: pendingCount > 0 ? 'Urgent' : 'Clear',
              trendType: pendingCount > 0 ? 'urgent' : 'positive',
              badgeText: pendingCount > 0 ? 'Pending' : 'Clear',
              iconName: 'Clock',
            },
            {
              id: 'avg-checkout-time',
              title: 'Avg Checkout Time',
              value: '45s',
              subtitle: 'Fast Turnaround',
              trend: 'Optimal',
              trendType: 'positive',
              badgeText: 'Healthy',
              iconName: 'Timer',
            },
            {
              id: 'refund-requests',
              title: 'Refund Requests',
              value: '0',
              subtitle: 'Pending Approval',
              trend: 'Clear',
              trendType: 'positive',
              badgeText: '0 Open',
              iconName: 'RotateCcw',
            },
            {
              id: 'digital-payments',
              title: 'Digital Payments',
              value: `${digitalPercent}%`,
              subtitle: `${digitalCount} Non-Cash`,
              trend: 'Live',
              trendType: 'positive',
              badgeText: `${digitalPercent}%`,
              iconName: 'Smartphone',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load cashier stat cards:', err);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Receipt':
        return <Receipt className="w-4 h-4 text-teal-500" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Timer':
        return <Timer className="w-4 h-4 text-teal-500" />;
      case 'RotateCcw':
        return <RotateCcw className="w-4 h-4 text-red-500" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-violet-500" />;
      default:
        return <Receipt className="w-4 h-4 text-amber-500" />;
    }
  };

  const getIconContainerStyle = (id: string) => {
    switch (id) {
      case 'transactions-today':
        return 'bg-teal-500/10 outline-teal-500/20 text-teal-500';
      case 'revenue-collected':
        return 'bg-blue-500/10 outline-blue-500/20 text-blue-500';
      case 'pending-payments':
        return 'bg-amber-500/10 outline-amber-500/20 text-amber-500';
      case 'avg-checkout-time':
        return 'bg-teal-500/10 outline-teal-500/20 text-teal-500';
      case 'refund-requests':
        return 'bg-red-500/10 outline-red-500/20 text-red-500';
      case 'digital-payments':
        return 'bg-violet-500/10 outline-violet-500/20 text-violet-500';
      default:
        return 'bg-amber-500/10 outline-amber-500/20 text-amber-500';
    }
  };

  const getBadgeStyle = (id: string) => {
    switch (id) {
      case 'transactions-today':
        return 'bg-teal-500/10 text-teal-500';
      case 'revenue-collected':
        return 'bg-gray-900 text-blue-500';
      case 'pending-payments':
        return 'bg-stone-800 text-red-500';
      case 'avg-checkout-time':
        return 'bg-gray-900 text-emerald-500';
      case 'refund-requests':
        return 'bg-stone-900 text-red-500';
      case 'digital-payments':
        return 'bg-gray-900 text-violet-500';
      default:
        return 'bg-gray-900 text-amber-500';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 font-['Inter']">
      {cards.map((card) => (
        <div
          key={card.id}
          className="min-h-[150px] relative bg-neutral-900 rounded-2xl shadow-[0px_0px_2px_0px_rgba(75,75,75,1.00)] border border-white/5 p-3.5 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all hover:scale-[1.01]"
        >
          {/* Top Row: Icon and Pill Badge */}
          <div className="flex items-center justify-between">
            <div
              className={`size-7 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-center ${getIconContainerStyle(
                card.id
              )}`}
            >
              {getIcon(card.iconName)}
            </div>

            <span
              className={`px-1.5 py-0.5 rounded-[5px] text-[10px] sm:text-xs font-medium font-['Inter'] leading-4 ${getBadgeStyle(
                card.id
              )}`}
            >
              {card.badgeText}
            </span>
          </div>

          {/* Metric Value */}
          <div className="pt-2">
            <div className="text-white text-xl sm:text-2xl font-bold font-['Inter'] leading-tight tracking-tight truncate">
              {card.value}
            </div>
            <div className="text-white text-xs sm:text-sm font-medium font-['Inter'] leading-4 mt-1.5 truncate">
              {card.title}
            </div>
            <div className="text-slate-400 text-[10px] sm:text-xs font-normal font-['Inter'] leading-4 mt-0.5 truncate">
              {card.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
