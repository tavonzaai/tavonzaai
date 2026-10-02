'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { orderStatusFilterOptions } from '../ordersData';
import { OrderRow } from '../types';

export interface OrdersFilterBarProps {
  orders: OrderRow[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function OrdersFilterBar({
  orders,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: OrdersFilterBarProps) {
  const getStatusCount = (st: string) => {
    if (st === 'All') return orders.length;
    return orders.filter((o) => o.status === st).length;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
      {/* Status Filter Tabs */}
      <div className="flex items-center flex-wrap gap-2">
        {orderStatusFilterOptions.map((st) => {
          const count = getStatusCount(st);
          const isActive = statusFilter === st;

          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[5px] text-base font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-white font-medium'
                  : 'text-neutral-400 border border-neutral-700/60 hover:text-white hover:border-neutral-500'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Input Box */}
      <div className="w-full lg:w-64 h-9 px-3.5 bg-zinc-900 rounded-[5px] border border-neutral-700 flex items-center gap-2.5">
        <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Orders..."
          className="w-full bg-transparent text-base text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
