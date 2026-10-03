'use client';

import React from 'react';
import { Download, Plus } from 'lucide-react';

interface CustomersHeaderProps {
  customerCount: number;
  onExport: () => void;
  onAddCustomer: () => void;
}

export default function CustomersHeader({
  customerCount,
  onExport,
  onAddCustomer,
}: CustomersHeaderProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] leading-tight">
          Customers
        </h1>
        <p className="text-slate-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
          {customerCount} registered customers
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-[10px] border border-white/15 flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onAddCustomer}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-[10px] flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer shadow-sm shadow-amber-400/20"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Customer</span>
        </button>
      </div>
    </div>
  );
}
