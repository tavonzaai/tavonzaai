'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { POSCategory } from '../types';
import { POS_CATEGORIES } from '../posData';

export interface POSSearchAndCategoriesProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: POSCategory;
  setActiveCategory: (cat: POSCategory) => void;
}

export default function POSSearchAndCategories({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: POSSearchAndCategoriesProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Search Input Bar */}
      <div className="w-full h-11 px-4 bg-zinc-900/90 rounded-xl border border-neutral-800 flex items-center gap-3 focus-within:border-amber-400/80 transition-colors">
        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Inventory or menu items..."
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-600 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-sm text-zinc-500 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 custom-scrollbar">
        <div className="inline-flex rounded-lg bg-zinc-900/80 border border-white/10 p-0.5">
          {POS_CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat;
            const isFirst = idx === 0;
            const isLast = idx === POS_CATEGORIES.length - 1;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-base font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isFirst ? 'rounded-l-md' : ''
                } ${isLast ? 'rounded-r-md' : ''} ${
                  isActive
                    ? 'bg-amber-400 text-white font-semibold shadow-md shadow-amber-400/20'
                    : 'text-neutral-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


