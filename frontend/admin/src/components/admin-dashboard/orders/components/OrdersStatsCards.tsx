'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { OrderRow } from '../types';

export interface OrdersStatsCardsProps {
  orders: OrderRow[];
}

export default function OrdersStatsCards({ orders }: OrdersStatsCardsProps) {
  const getStatusCount = (st: string) => {
    return orders.filter((o) => o.status === st).length;
  };

  const stats = [
    {
      value: orders.length.toString(),
      label: 'Total Orders',
      valueColor: 'text-white',
    },
    {
      value: getStatusCount('Pending').toString().padStart(2, '0'),
      label: 'Pending',
      valueColor: 'text-white',
    },
    {
      value: getStatusCount('Preparing').toString().padStart(2, '0'),
      label: 'Preparing',
      valueColor: 'text-white',
    },
    {
      value: '$406',
      label: 'Revenue Today',
      valueColor: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="h-20 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-black/5 outline outline-1 outline-offset-[-1px] outline-black/5 px-5 flex items-center justify-between"
        >
          <div className="flex flex-col justify-center">
            <div className={`text-2xl font-bold font-['Inter'] leading-5 ${stat.valueColor}`}>
              {stat.value}
            </div>
            <div className="text-white text-sm font-semibold font-['Inter'] leading-5 mt-1">
              {stat.label}
            </div>
          </div>
          <div className="size-9 bg-zinc-900 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

