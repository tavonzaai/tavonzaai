'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { TableFilter } from '../types';

export interface QRSearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: TableFilter;
  setStatusFilter: (filter: TableFilter) => void;
}

export default function QRSearchAndFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: QRSearchAndFiltersProps) {
  const filterOptions: TableFilter[] = ['All', 'Occupied', 'Available'];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full pt-2">
      {/* Segmented Filter Pills */}
      <div className="h-9 inline-flex items-center rounded-lg bg-neutral-400/5 border border-neutral-400/20 backdrop-blur-[10.20px] p-0.5 self-start">
        {filterOptions.map((filter, idx) => {
          const isActive = statusFilter === filter;
          const isFirst = idx === 0;
          const isLast = idx === filterOptions.length - 1;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`h-8 px-4 text-sm font-medium font-['Inter'] transition-all cursor-pointer whitespace-nowrap ${
                isFirst ? 'rounded-l-md' : ''
              } ${isLast ? 'rounded-r-md' : ''} ${
                isActive
                  ? 'bg-yellow-500 text-white font-semibold shadow-md shadow-yellow-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="w-full sm:w-80 h-9 px-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-[10.20px] flex items-center gap-2.5 focus-within:border-amber-400 transition-colors">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find Table..."
          className="w-full bg-transparent text-base text-white placeholder:text-stone-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-500 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
