import React from 'react';
import { X, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { BranchPerformanceRecord } from '../types';

interface BranchIntelligenceModalProps {
  branch: BranchPerformanceRecord;
  onClose: () => void;
}

export const BranchIntelligenceModal: React.FC<BranchIntelligenceModalProps> = ({
  branch,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold">
                {branch.name} Intelligence
              </h3>
              <p className="text-xs text-neutral-400">
                {branch.restaurant} · {branch.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Top stats summary grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Total Revenue</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {branch.revenueFormatted}
              </span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Total Orders</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {branch.orders.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 block">Growth</span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  branch.growth >= 0 ? 'text-green-500' : 'text-red-400'
                }`}
              >
                {branch.growthFormatted}
              </span>
            </div>
          </div>

          {/* Culinary & Operational Insights */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="text-neutral-300 font-semibold text-xs flex items-center justify-between">
              <span>Culinary Performance</span>
              <span className="text-neutral-500 font-normal">Last 30 days</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Top Performing Item:</span>
              <span className="text-amber-300 font-medium">{branch.topItem}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Average Check / Table:</span>
              <span className="text-white font-mono font-medium">{branch.avgOrderFormatted}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Performance Rating:</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  branch.performance === 'Excellent' || branch.performance === 'Strong'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-orange-400/10 text-orange-400'
                }`}
              >
                {branch.performance}
              </span>
            </div>
          </div>

          {/* Payment Split Distribution */}
          <div className="space-y-2">
            <div className="flex justify-between text-neutral-400">
              <span>Payment Channels</span>
              <span>Card {branch.cardSplit}% / Cash {branch.cashSplit}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${branch.cardSplit}%` }}
              />
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${branch.cashSplit}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              toast.success(`Generated audit report for ${branch.name}`);
              onClose();
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="size-3.5 text-neutral-950" />
            <span>Download Audit PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
