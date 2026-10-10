'use client';

import React from 'react';
import { BarChart3, FileText, Download } from 'lucide-react';

interface ReportsHeaderProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export function ReportsHeader({ onExportPDF, onExportCSV }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            Reports
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium">
            <BarChart3 className="size-3" />
            Intelligence Hub
          </span>
        </div>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          Analyze performance across restaurants, branches, staff, menu, and payments.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportPDF}
          className="px-3.5 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-white text-sm font-medium font-sans flex items-center gap-2 transition-all active:scale-95"
        >
          <FileText className="size-4 text-white" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={onExportCSV}
          className="px-3.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 text-sm font-semibold font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Download className="size-4 text-neutral-900 stroke-[2.5]" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
