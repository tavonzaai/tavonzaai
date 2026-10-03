'use client';

import React from 'react';
import { MarketplaceCategory } from '../types';
import { MARKETPLACE_CATEGORIES } from '../marketplaceData';

interface MarketplaceCategoryTabsProps {
  selectedCategory: MarketplaceCategory;
  onSelectCategory: (cat: MarketplaceCategory) => void;
  categoryCounts: Record<string, number>;
}

export default function MarketplaceCategoryTabs({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: MarketplaceCategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar w-full">
      {MARKETPLACE_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat];

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-2.5 rounded-[5px] text-sm sm:text-base font-medium font-['Inter'] transition-all duration-150 cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
              isSelected
                ? 'bg-yellow-500 text-white font-bold outline outline-1 outline-yellow-400 shadow-md shadow-yellow-500/20'
                : 'bg-white/5 outline outline-1 outline-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{cat}</span>
            {count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-white/10 text-zinc-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
