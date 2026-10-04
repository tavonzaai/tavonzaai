'use client';

import React from 'react';
import {
  ShieldAlert,
  Clock,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Package,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTables: (filter?: string) => void;
  onSelectTable: (tableId: string) => void;
}

export default function DashboardView({
  onNavigateToTables,
  onSelectTable,
}: DashboardViewProps) {
  const needsActionItems = [
    {
      id: 'action-1',
      title: 'Payment Pending',
      timeHighlight: '10m',
      subtext: 'Table 12',
      tableId: 'T12',
      icon: ShieldAlert,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10 border-red-500/20',
    },
    {
      id: 'action-2',
      title: 'Gril station running behind',
      timeHighlight: null,
      subtext: '4 orders delayed',
      tableId: 'T04',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10 border-yellow-400/20',
    },
    {
      id: 'action-3',
      title: 'Staff Unavailable',
      timeHighlight: null,
      subtext: 'J. smith ( Waiter )',
      tableId: null,
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10 border-yellow-400/20',
    },
    {
      id: 'action-4',
      title: 'Low stock alert',
      timeHighlight: null,
      subtext: 'Premium Tequila',
      tableId: null,
      icon: Package,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10 border-blue-400/20',
    },
  ];

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
              <span className="text-emerald-500 font-medium">Open</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Operating Normally , Monday,sep 28</span>
          </div>
        </div>

        {/* Dinner Rush Alert Banner */}
        <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-white text-sm font-normal font-['Inter']">
            Dinner rush expected in 45 mins, 1 staff member pending arrival.
          </span>
        </div>
      </div>

      {/* 2. Needs Action Section */}
      <div className="space-y-3.5">
        <h2 className="text-white text-2xl font-medium font-['Inter']">
          Needs Action
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  24
                </span>
                <span className="text-emerald-500 text-base font-medium font-['Inter']">
                  18 occupied
                </span>
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              6 tables available for walk-ins
            </span>
          </div>

          {/* Pending Orders Card */}
          <div
            onClick={() => onNavigateToTables('preparing')}
            className="p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col justify-between gap-3 cursor-pointer transition shadow-sm group"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-neutral-400 text-sm font-medium font-['Inter']">
                Pending Orders
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-semibold font-['Inter']">
                  14
                </span>
                <span className="text-yellow-400 text-base font-medium font-['Inter']">
                  4 Delayed
                </span>
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              7 preparing · 3 ready to serve
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
                  02
                </span>
                <span className="text-white text-base font-medium font-['Inter']">
                  $184.50
                </span>
              </div>
            </div>
            <span className="text-neutral-400 text-xs sm:text-sm font-normal font-['Inter']">
              Table 12, Table 08
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
