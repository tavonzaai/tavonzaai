'use client';

import React from 'react';
import { KitchenOrder, KitchenStatus } from '../types';

export interface KDSTabsProps {
  orders: KitchenOrder[];
  activeStatus: KitchenStatus;
  onSelectStatus: (status: KitchenStatus) => void;
}

export default function KDSTabs({
  orders,
  activeStatus,
  onSelectStatus,
}: KDSTabsProps) {
  const newCount = orders.filter((o) => o.status === 'New Orders').length;
  const inProgressCount = orders.filter((o) => o.status === 'In Progress').length;
  const readyCount = orders.filter((o) => o.status === 'Ready To Serve').length;

  const tabs: { status: KitchenStatus; label: string; count: number; activeBg: string }[] = [
    {
      status: 'New Orders',
      label: 'New Orders',
      count: newCount,
      activeBg: 'bg-indigo-700 text-white font-medium shadow-sm',
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      count: inProgressCount,
      activeBg: 'bg-yellow-500 text-white font-semibold shadow-sm',
    },
    {
      status: 'Ready To Serve',
      label: 'Ready To Serve',
      count: readyCount,
      activeBg: 'bg-green-700 text-white font-medium shadow-sm',
    },
  ];

  return (
    <div className="flex items-center gap-4 w-full pt-1">
      {/* Segmented Tab Pill Group */}
      <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden">
        {tabs.map((tab, idx) => {
          const isActive = activeStatus === tab.status;
          const isFirst = idx === 0;
          const isLast = idx === tabs.length - 1;

          return (
            <button
              key={tab.status}
              type="button"
              onClick={() => onSelectStatus(tab.status)}
              className={`h-9 px-4 text-base font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isFirst ? 'rounded-l-md' : ''
              } ${isLast ? 'rounded-r-md' : ''} ${
                isActive
                  ? tab.activeBg
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-sm ${isActive ? 'opacity-90' : 'text-neutral-500'}`}>
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
