'use client';

import React from 'react';
import { Search } from 'lucide-react';
import {
  InventoryCategory,
  StockStatusFilter,
  InventoryItem,
} from '../types';

export interface InventoryFiltersProps {
  items: InventoryItem[];
  activeCategory: InventoryCategory;
  onSelectCategory: (category: InventoryCategory) => void;
  activeStatusFilter: StockStatusFilter;
  onSelectStatusFilter: (status: StockStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function InventoryFilters({
  items,
  activeCategory,
  onSelectCategory,
  activeStatusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchChange,
}: InventoryFiltersProps) {
  const categories: InventoryCategory[] = [
    'All',
    'Dairy',
    'Protein',
    'Produce',
    'Dry Goods',
    'Beverages',
    'Condiments',
  ];

  const statusFilters: { id: StockStatusFilter; label: string }[] = [
    { id: 'All', label: 'All' },
    { id: 'Critical', label: '🔴 Critical' },
    { id: 'Low', label: '🟡 Low' },
    { id: 'Out', label: '⚫ Out' },
    { id: 'OK', label: '🟢 OK' },
  ];

  return (
    <div className="space-y-3.5 w-full pt-1">
      {/* Top Filter Controls: Categories (Left) & Stock Status (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        {/* Categories Tabs */}
        <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden max-w-full">
          {categories.map((category, idx) => {
            const isActive = activeCategory === category;
            const isFirst = idx === 0;
            const isLast = idx === categories.length - 1;
            const count =
              category === 'All'
                ? items.length
                : items.filter((i) => i.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`h-8 px-3.5 text-sm font-normal font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  isFirst ? 'rounded-l-md' : ''
                } ${isLast ? 'rounded-r-md' : ''} ${
                  isActive
                    ? 'bg-yellow-500 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Stock Status Pills */}
        <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden">
          {statusFilters.map((status, idx) => {
            const isActive = activeStatusFilter === status.id;
            const isFirst = idx === 0;
            const isLast = idx === statusFilters.length - 1;

            return (
              <button
                key={status.id}
                type="button"
                onClick={() => onSelectStatusFilter(status.id)}
                className={`h-8 px-3 text-sm font-normal font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  isFirst ? 'rounded-l-md' : ''
                } ${isLast ? 'rounded-r-md' : ''} ${
                  isActive
                    ? 'bg-yellow-500 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-width Search Input */}
      <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 flex items-center gap-3.5 focus-within:border-amber-400/60 transition-colors">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Inventory by ingredient, supplier, category..."
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
