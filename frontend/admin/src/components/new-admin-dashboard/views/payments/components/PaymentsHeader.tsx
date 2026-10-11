'use client';

import React from 'react';
import { ChevronDown, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentsHeaderProps {
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  onOpenBatchModal: () => void;
  onExportCSV: () => void;
}

export function PaymentsHeader({
  selectedBranch,
  onBranchChange,
  onOpenBatchModal,
  onExportCSV,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            Payments
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gateway Online
          </span>
        </div>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          Payment overview and settlement activity for {selectedBranch}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Branch Pill Selector */}
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => {
              onBranchChange(e.target.value);
              toast.info(`Switched view to ${e.target.value}`);
            }}
            className="appearance-none h-10 pl-3.5 pr-8 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors focus:outline-none cursor-pointer"
          >
            <option value="Gulshan Flagship">Gulshan Flagship</option>
            <option value="Georgia Flagship">Georgia Flagship</option>
            <option value="Florida Flagship">Florida Flagship</option>
            <option value="Illinois Flagship">Illinois Flagship</option>
            <option value="All Branches">All Branches</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500 pointer-events-none" />
        </div>

        {/* Settle Batch Button */}
        <button
          onClick={onOpenBatchModal}
          className="h-10 px-3.5 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-medium text-xs rounded-lg inline-flex items-center gap-2 transition-all shadow-sm"
        >
          <RotateCcw className="size-3.5" />
          <span>Settle Batch ($ 5K)</span>
        </button>

        {/* Export Report Button */}
        <button
          onClick={onExportCSV}
          className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Download className="size-3.5 text-neutral-950" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
