'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';

interface TransactionsHeaderProps {
  totalCount: number;
  onExportCSV: () => void;
  onPrint: () => void;
}

export default function TransactionsHeader({
  totalCount,
  onExportCSV,
  onPrint,
}: TransactionsHeaderProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] leading-tight">
          Transactions
        </h1>
        <p className="text-slate-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
          {totalCount} transactions recorded today
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={onExportCSV}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-[10px] border border-white/15 flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-[10px] flex items-center gap-1.5 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer shadow-sm shadow-amber-400/20"
        >
          <Printer className="w-3.5 h-3.5 text-white" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}
