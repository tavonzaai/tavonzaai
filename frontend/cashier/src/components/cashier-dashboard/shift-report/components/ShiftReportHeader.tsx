'use client';

import React from 'react';
import { Printer, Download, LogOut } from 'lucide-react';
import { ShiftInfo } from '../types';

interface ShiftReportHeaderProps {
  shiftInfo: ShiftInfo;
  onPrint: () => void;
  onExportPDF: () => void;
  onCloseShift: () => void;
}

export const ShiftReportHeader: React.FC<ShiftReportHeaderProps> = ({
  shiftInfo,
  onPrint,
  onExportPDF,
  onCloseShift,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Shift Report
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          {shiftInfo.date} · Shift started {shiftInfo.startTime} · {shiftInfo.cashierName}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Print Report */}
        <button
          type="button"
          onClick={onPrint}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold font-['Inter'] rounded-[10px] border border-white/10 backdrop-blur-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-400" />
          <span>Print Report</span>
        </button>

        {/* Export PDF */}
        <button
          type="button"
          onClick={onExportPDF}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold font-['Inter'] rounded-[10px] border border-white/10 backdrop-blur-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-200" />
          <span>Export PDF</span>
        </button>

        {/* Close Shift */}
        <button
          type="button"
          onClick={onCloseShift}
          className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm font-medium font-['Plus_Jakarta_Sans'] rounded-lg border border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-red-500" />
          <span>Close Shift</span>
        </button>
      </div>
    </div>
  );
};
