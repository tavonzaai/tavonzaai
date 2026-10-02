'use client';

import React, { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { POS_TABLES } from '../posData';

export interface POSHeaderProps {
  selectedTable: string;
  onSelectTable: (table: string) => void;
}

export default function POSHeader({
  selectedTable,
  onSelectTable,
}: POSHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-white text-3xl md:text-4xl font-semibold font-['Inter'] leading-8 md:leading-9">
          Point of Sale
        </h1>
        <p className="text-zinc-500 text-sm md:text-base font-normal font-['Inter'] leading-5 mt-0.5">
          Manage and monitor all customer orders in real time.
        </p>
      </div>

      {/* Table Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 rounded-[10px] border border-gray-200/20 flex items-center gap-2 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer"
        >
          <Utensils className="w-3.5 h-3.5 text-amber-400" />
          <span>Table: {selectedTable}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 p-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-zinc-500 uppercase px-2 py-1">
                Select Active Table
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {POS_TABLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onSelectTable(t);
                      setDropdownOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-sm font-semibold text-center transition-all cursor-pointer ${
                      selectedTable === t
                        ? 'bg-amber-400 text-white font-bold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

