'use client';

import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { POS_TABLES } from '../posData';

interface POSHeaderControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
}

export default function POSHeaderControls({
  searchQuery,
  setSearchQuery,
  selectedTable,
  setSelectedTable,
}: POSHeaderControlsProps) {
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 w-full">
      {/* Search Inventory Input */}
      <div className="flex-1 relative">
        <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center gap-3.5 overflow-hidden transition focus-within:outline-amber-500/60">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Inventory..."
            className="w-full bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-base sm:text-lg font-normal font-['Inter']"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-sm text-zinc-500 hover:text-white px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Selector */}
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto relative">
        <span className="text-white text-base sm:text-lg font-medium font-['Inter'] leading-6">
          Table
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
            className="w-28 h-10 px-3 bg-zinc-900 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-neutral-800 inline-flex justify-between items-center text-white text-base sm:text-lg font-normal font-['Inter'] cursor-pointer hover:bg-zinc-800 transition"
          >
            <span>{selectedTable}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* Table Dropdown Menu */}
          {tableDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 max-h-56 overflow-y-auto custom-scrollbar bg-zinc-900 border border-neutral-800 rounded-lg shadow-2xl z-40 py-1 font-['Inter']">
              {POS_TABLES.map((table) => (
                <button
                  key={table}
                  type="button"
                  onClick={() => {
                    setSelectedTable(table);
                    setTableDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-sm sm:text-base transition-colors cursor-pointer ${
                    selectedTable === table
                      ? 'bg-yellow-500 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
