'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { RecipeCategory } from '../types';

export interface RecipesFiltersProps {
  categories: RecipeCategory[];
  activeCategory: RecipeCategory;
  onSelectCategory: (cat: RecipeCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function RecipesFilters({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: RecipesFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full pt-1">
      {/* Search Input */}
      <div className="w-full md:w-96 h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 flex items-center gap-3.5 focus-within:border-amber-400/60 transition-colors">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search recipes..."
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-600 focus:outline-none font-['Inter']"
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

      {/* Category Segmented Tabs */}
      <div className="inline-flex items-center rounded-lg border border-white/20 bg-neutral-900/60 p-0.5 self-start overflow-hidden">
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat;
          const isFirst = idx === 0;
          const isLast = idx === categories.length - 1;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`h-9 px-3.5 text-sm font-normal font-['Inter'] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                isFirst ? 'rounded-l-md' : ''
              } ${isLast ? 'rounded-r-md' : ''} ${
                isActive
                  ? 'bg-yellow-500 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l border-white/10 first:border-l-0'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
