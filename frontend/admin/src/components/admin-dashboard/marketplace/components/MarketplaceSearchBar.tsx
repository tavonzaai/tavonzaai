'use client';

import React from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';

interface MarketplaceSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showInstalledOnly: boolean;
  setShowInstalledOnly: (v: boolean) => void;
  totalApps: number;
}

export default function MarketplaceSearchBar({
  searchQuery,
  setSearchQuery,
  showInstalledOnly,
  setShowInstalledOnly,
  totalApps,
}: MarketplaceSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
      {/* Search Input matching Figma */}
      <div className="relative flex-1 h-10">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search integrations, apps, or providers..."
          className="w-full h-full pl-11 pr-10 bg-zinc-900 rounded-[5px] outline outline-1 outline-neutral-800 text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle for Installed Apps */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowInstalledOnly(!showInstalledOnly)}
          className={`h-10 px-4 rounded-[5px] text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            showInstalledOnly
              ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm'
              : 'bg-zinc-900 border border-neutral-800 text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Installed Only</span>
        </button>
      </div>
    </div>
  );
}
