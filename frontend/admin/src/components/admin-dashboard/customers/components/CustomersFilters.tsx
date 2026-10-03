'use client';

import React from 'react';
import { Search } from 'lucide-react';

export interface CustomersFiltersProps {
  selectedSegment: string;
  onSelectSegment: (segment: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export default function CustomersFilters({
  selectedSegment,
  onSelectSegment,
  searchQuery,
  onSearchChange,
  totalCount,
}: CustomersFiltersProps) {
  const segments = [
    { label: `All(${totalCount})`, value: 'All' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Regular', value: 'Regular' },
    { label: 'New', value: 'New' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      {/* Segment Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {segments.map((seg) => {
          const isActive = selectedSegment === seg.value;

          return (
            <button
              key={seg.value}
              type="button"
              onClick={() => onSelectSegment(seg.value)}
              className={`h-9 px-3.5 py-2 text-base font-medium font-['Inter'] rounded-[5px] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-white font-semibold shadow-sm'
                  : 'bg-transparent text-neutral-400 hover:text-white border border-neutral-700/60 hover:bg-white/5'
              }`}
            >
              {seg.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-60">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customers..."
          className="w-full h-9 pl-9 pr-4 bg-zinc-900 rounded-[5px] border border-neutral-700 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 transition-colors font-['Inter']"
        />
      </div>
    </div>
  );
}
