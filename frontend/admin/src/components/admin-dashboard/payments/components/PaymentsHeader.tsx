'use client';

import React from 'react';
import { Download } from 'lucide-react';

export interface PaymentsHeaderProps {
  onExportReport: () => void;
}

export default function PaymentsHeader({ onExportReport }: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Payments
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Track all transactions, tips, and payment methods for today.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onExportReport}
          className="h-10 px-4 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] rounded-[10px] border border-neutral-700 text-white text-sm font-semibold font-['Inter'] flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
