'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { TransactionStatus } from '../types';

interface TransactionsFilterBarProps {
  activeStatus: TransactionStatus;
  setActiveStatus: (status: TransactionStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusCounts: {
    all: number;
    paid: number;
    pending: number;
    failed: number;
    refunded: number;
  };
}

export default function TransactionsFilterBar({
  activeStatus,
  setActiveStatus,
  searchQuery,
  setSearchQuery,
  statusCounts,
}: TransactionsFilterBarProps) {
  const tabs: { status: TransactionStatus; label: string }[] = [
    { status: 'All', label: `All(${statusCounts.all})` },
    { status: 'Paid', label: 'Paid' },
    { status: 'Pending', label: 'Pending' },
    { status: 'Failed', label: 'Failed' },
    { status: 'Refunded', label: 'Refunded' },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.status;
          return (
            <button
              key={tab.status}
              type="button"
              onClick={() => setActiveStatus(tab.status)}
              className={`h-9 px-4 sm:px-6 rounded-[5px] text-base font-medium font-['Inter'] whitespace-nowrap transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-amber-400 text-white shadow-sm font-semibold'
                  : 'bg-transparent text-neutral-400 hover:text-white border border-neutral-700/80 hover:border-neutral-500'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="w-full md:w-72 h-9 px-3 bg-zinc-900 rounded-[5px] border border-neutral-700 flex items-center gap-2.5 focus-within:border-amber-400 transition-colors">
        <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search TX ID, order, method..."
          className="w-full bg-transparent text-white text-sm placeholder:text-zinc-500 focus:outline-none font-['Inter']"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-zinc-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
