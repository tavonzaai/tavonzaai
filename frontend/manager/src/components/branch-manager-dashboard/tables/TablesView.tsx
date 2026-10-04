'use client';

import React, { useState } from 'react';
import { TableItem, TableStatus } from '../types';
import { Clock, User } from 'lucide-react';

interface TablesViewProps {
  initialFilter?: string;
  onSelectTable: (tableId: string) => void;
  tablesData: TableItem[];
}

export default function TablesView({
  initialFilter = 'all',
  onSelectTable,
  tablesData,
}: TablesViewProps) {
  const [filter, setFilter] = useState<string>(initialFilter);

  const filterTabs = [
    { id: 'all', label: 'ALL' },
    { id: 'available', label: 'Available' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'need_attention', label: 'Needs Attention' },
    { id: 'payment', label: 'Payment Pending' },
  ];

  const filteredTables = tablesData.filter((table) => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Occupied
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Ready
          </span>
        );
      case 'need_attention':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            Needs Attention
          </span>
        );
      case 'payment':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Payment Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Filter Tabs matching Figma */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                isActive
                  ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-sm'
                  : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isAvailable = table.status === 'available';

          return (
            <div
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-44 shadow-sm ${
                isAvailable
                  ? 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                  : 'bg-neutral-900 border-neutral-800 hover:border-amber-400/50 hover:bg-neutral-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-lg font-['Inter']">
                  {table.number}
                </span>
                {getStatusBadge(table.status)}
              </div>

              {!isAvailable ? (
                <div className="flex flex-col gap-1 text-xs font-['Inter']">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Waiter: <strong className="text-white font-medium">{table.waiter}</strong></span>
                  </div>
                  <span className="text-amber-400/90 font-medium">
                    {table.orderNumber} ({table.itemsCount} items)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 font-['Inter']">
                  Capacity: {table.capacity} guests · Ready for seating
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 font-['Inter']">
                <span>Capacity: {table.capacity}p</span>
                {!isAvailable && table.orderTime && (
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{table.orderTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
