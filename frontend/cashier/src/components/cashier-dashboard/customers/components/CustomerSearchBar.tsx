'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CustomerSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CustomerSearchBar({
  searchQuery,
  setSearchQuery,
}: CustomerSearchBarProps) {
  return (
    <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 flex items-center gap-3.5 focus-within:border-amber-400 transition-colors">
      <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search customers by name, email, phone, tier..."
        className="w-full bg-transparent text-white text-base placeholder:text-zinc-500 focus:outline-none font-['Inter']"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
