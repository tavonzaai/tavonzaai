'use client';

import React from 'react';
import { Search, Star } from 'lucide-react';
import { REVIEW_CATEGORIES } from '../reviewsData';

interface ReviewsFilterBarProps {
  selectedStars: number | 'All';
  setSelectedStars: (stars: number | 'All') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'All' | 'replied' | 'pending';
  setStatusFilter: (s: 'All' | 'replied' | 'pending') => void;
  totalCount: number;
}

export default function ReviewsFilterBar({
  selectedStars,
  setSelectedStars,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
}: ReviewsFilterBarProps) {
  const starOptions: (number | 'All')[] = ['All', 5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col space-y-3.5 w-full">
      {/* 1. Top Row: Star Segments (Left) & Search Input (Right) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        {/* Star Rating Segmented Bar */}
        <div className="inline-flex items-center rounded-lg border border-white/20 overflow-hidden bg-black/40 h-9 flex-shrink-0">
          {starOptions.map((st, idx) => {
            const isSelected = selectedStars === st;
            return (
              <button
                key={String(st)}
                onClick={() => setSelectedStars(st)}
                className={`h-full px-3.5 flex items-center justify-center gap-1 text-base font-medium transition-colors cursor-pointer border-r border-white/20 last:border-r-0 ${
                  isSelected
                    ? 'bg-yellow-500 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st === 'All' ? (
                  <span>All</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>{st}</span>
                    <Star className="w-2.5 h-2.5 fill-current text-gray-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md h-9">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full h-full pl-10 pr-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {REVIEW_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`h-9 px-3.5 py-2 rounded-sm border text-sm sm:text-base font-normal font-['Inter'] transition-all flex-shrink-0 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'bg-yellow-500 text-white border-yellow-500 font-medium rounded-[5px] shadow-sm'
                  : 'bg-transparent border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
