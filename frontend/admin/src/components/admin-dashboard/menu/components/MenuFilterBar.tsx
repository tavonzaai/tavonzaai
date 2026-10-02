'use client';

import React from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { MenuCategory } from '../types';

export interface MenuFilterBarProps {
  categories: MenuCategory[];
  activeCategory: MenuCategory;
  onSelectCategory: (category: MenuCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

export default function MenuFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isSearching = false,
}: MenuFilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full pt-2">
      {/* Category Segmented Tabs */}
      <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden flex-wrap max-w-full">
        {categories.map((category, idx) => {
          const isActive = activeCategory === category;
          const isFirst = idx === 0;
          const isLast = idx === categories.length - 1;

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
              {category}
            </button>
          );
        })}
      </div>

      {/* Search Input with Route Query & API Hit Feedback */}
      <div className="w-full lg:w-96 h-10 px-3.5 bg-gray-50/5 rounded-lg border border-stone-300/15 flex items-center gap-2.5 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
        )}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items by name or keyword..."
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none font-['Inter']"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            title="Clear search"
            className="text-xs text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}

