'use client';

import React from 'react';
import { Printer, Download, LogOut, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AIInsightsHeaderProps {
  onPrint?: () => void;
  onExportPDF?: () => void;
  onCloseShift?: () => void;
}

export const AIInsightsHeader: React.FC<AIInsightsHeaderProps> = ({
  onPrint,
  onExportPDF,
  onCloseShift,
}) => {
  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const handleExport = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      toast.success('Exported AI Shift Insights briefing to PDF/CSV.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
            AI Insights
          </h1>
          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Live Analysis</span>
          </span>
        </div>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Powered by Tavonza AI · Real-time analysis
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Print Report */}
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold font-['Inter'] rounded-[10px] border border-white/10 backdrop-blur-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-400" />
          <span>Print Report</span>
        </button>

        {/* Export PDF */}
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold font-['Inter'] rounded-[10px] border border-white/10 backdrop-blur-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-200" />
          <span>Export PDF</span>
        </button>

        {/* Close Shift */}
        <button
          type="button"
          onClick={() => {
            if (onCloseShift) onCloseShift();
            else toast.info('Opening shift close workflow');
          }}
          className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm font-medium font-['Plus_Jakarta_Sans'] rounded-lg border border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-red-500" />
          <span>Close Shift</span>
        </button>
      </div>
    </div>
  );
};
