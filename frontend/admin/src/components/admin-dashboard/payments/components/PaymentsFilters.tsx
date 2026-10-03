'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { PaymentMethod } from '../types';

export interface PaymentsFiltersProps {
  activeMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function PaymentsFilters({
  activeMethod,
  onSelectMethod,
  searchQuery,
  onSearchChange,
}: PaymentsFiltersProps) {
  const methods: PaymentMethod[] = ['All Methods', 'Card', 'Digital', 'Cash'];

  return (
    <div className="space-y-3.5 w-full pt-1">
      {/* Method Tabs */}
      <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden">
        {methods.map((method, idx) => {
          const isActive = activeMethod === method;
          const isFirst = idx === 0;
          const isLast = idx === methods.length - 1;

          return (
            <button
              key={method}
              type="button"
              onClick={() => onSelectMethod(method)}
              className={`h-9 px-4 text-sm font-normal font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                isFirst ? 'rounded-l-md' : ''
              } ${isLast ? 'rounded-r-md' : ''} ${
                isActive
                  ? 'bg-yellow-500 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 flex items-center gap-3.5 focus-within:border-amber-400/60 transition-colors">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Transactions by ID, customer, order #, table, server..."
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none font-['Inter']"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
