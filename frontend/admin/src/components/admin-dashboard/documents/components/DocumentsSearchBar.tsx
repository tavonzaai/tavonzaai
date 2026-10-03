'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { DocumentCategory, DocumentStatus } from '../types';
import { DOCUMENT_CATEGORIES } from '../documentsData';

interface DocumentsSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: DocumentCategory | 'All';
  setSelectedCategory: (cat: DocumentCategory | 'All') => void;
  selectedStatus: DocumentStatus | 'All';
  setSelectedStatus: (status: DocumentStatus | 'All') => void;
  totalCount: number;
}

export default function DocumentsSearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  totalCount,
}: DocumentsSearchBarProps) {
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
          placeholder="Search Documents....."
          className="w-full h-full pl-11 pr-10 bg-zinc-900 rounded-[5px] outline outline-1 outline-neutral-800 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns (Status & Category) */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="h-10 px-3 bg-zinc-900 rounded-[5px] outline outline-1 outline-neutral-800 text-zinc-300 text-sm font-medium focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Valid">Valid</option>
          <option value="Expiring Soon">Expiring Soon</option>
          <option value="Expired">Expired</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="h-10 px-3 bg-zinc-900 rounded-[5px] outline outline-1 outline-neutral-800 text-zinc-300 text-sm font-medium focus:outline-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
