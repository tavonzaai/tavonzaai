'use client';

import React from 'react';
import { CardTier } from '../types';
import { CARD_TIERS } from '../tavonzaCardData';
import { Search, X } from 'lucide-react';

interface TavonzaCardFilterBarProps {
  selectedTier: CardTier | 'All Tiers';
  onSelectTier: (tier: CardTier | 'All Tiers') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'All' | 'Active' | 'Inactive';
  setStatusFilter: (s: 'All' | 'Active' | 'Inactive') => void;
}

export default function TavonzaCardFilterBar({
  selectedTier,
  onSelectTier,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: TavonzaCardFilterBarProps) {
  const allTiers: Array<CardTier | 'All Tiers'> = ['All Tiers', ...CARD_TIERS];

  return (
    <div className="space-y-4 w-full">
      {/* 1. Tier Filter Pills matching Figma */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {allTiers.map((tier) => {
          const isSelected = selectedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onSelectTier(tier)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-[5px] text-sm sm:text-base font-medium font-['Inter'] transition-all cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-yellow-500 text-white font-bold outline outline-1 outline-yellow-400 shadow-md shadow-yellow-500/20'
                  : 'outline outline-1 outline-white/20 text-zinc-400 hover:text-white bg-white/5'
              }`}
            >
              {tier}
            </button>
          );
        })}
      </div>

      {/* 2. Search & Status Filter Group matching Figma */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1 h-9">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Transactions, Card ID, member name or email..."
            className="w-full h-full pl-10 pr-9 bg-zinc-900 rounded-[5px] outline outline-1 outline-neutral-800 text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs: All | Active | Inactive */}
        <div className="h-9 inline-flex rounded-lg overflow-hidden border border-white/20 bg-black/40 flex-shrink-0 self-start sm:self-auto">
          {(['All', 'Active', 'Inactive'] as const).map((st, idx) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`h-full px-4 text-sm sm:text-base font-medium font-['Inter'] transition-colors cursor-pointer ${
                  idx > 0 ? 'border-l border-white/20' : ''
                } ${
                  isSelected
                    ? 'bg-yellow-500 text-white font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
