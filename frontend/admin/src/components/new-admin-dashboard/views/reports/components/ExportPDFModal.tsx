import React from 'react';
import { X, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ExportPDFModalProps {
  dateRange: string;
  selectedRestaurant: string;
  selectedBranch: string;
  onClose: () => void;
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({
  dateRange,
  selectedRestaurant,
  selectedBranch,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FileText className="size-5 text-amber-400" />
            <h3 className="text-base font-semibold">Executive Sales Report (PDF)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-neutral-300">
            Generate and print a certified, publication-grade executive sales & settlement report for the selected period.
          </p>

          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Document:</span>
              <span className="text-white font-medium">Tavonza Executive Performance Statement</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Timeframe:</span>
              <span className="text-white font-mono">{dateRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Scope:</span>
              <span className="text-white">{selectedRestaurant} ({selectedBranch})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Gross Sales Volume:</span>
              <span className="text-amber-400 font-mono font-bold">$ 8.42M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Net Revenue:</span>
              <span className="text-emerald-400 font-mono font-bold">$ 2.62M</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.success('Compiling PDF statement and triggering browser print...');
              onClose();
              setTimeout(() => {
                window.print();
              }, 300);
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Printer className="size-3.5 text-neutral-950" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
