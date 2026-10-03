'use client';

import React, { useState } from 'react';
import { X, LogOut, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ShiftStats, ShiftInfo } from '../types';

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftInfo: ShiftInfo;
  stats: ShiftStats;
  onShiftClosed: () => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  isOpen,
  onClose,
  shiftInfo,
  stats,
  onShiftClosed,
}) => {
  const [actualCash, setActualCash] = useState<string>(
    stats.cashCollected.toFixed(2)
  );
  const [notes, setNotes] = useState<string>('All payments reconciled. No register issues.');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  if (!isOpen) return null;

  const expected = stats.cashCollected;
  const counted = parseFloat(actualCash) || 0;
  const variance = counted - expected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      toast.error('Please check the confirmation box to close your shift.');
      return;
    }

    toast.success(
      `Shift closed successfully for ${shiftInfo.cashierName}! X-Report generated and synced to manager ledger.`
    );
    onShiftClosed();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Close Register Shift
              </h3>
              <p className="text-sm text-slate-400 font-['Plus_Jakarta_Sans']">
                {shiftInfo.cashierName} · {shiftInfo.branch}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Summary Box */}
        <div className="grid grid-cols-2 gap-2.5 p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Shift Duration</span>
            <span className="text-white font-semibold">{stats.cashierHours}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Total Revenue</span>
            <span className="text-teal-400 font-bold font-['JetBrains_Mono']">
              ${stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Card Payments</span>
            <span className="text-blue-400 font-bold font-['JetBrains_Mono']">
              ${stats.cardPayments.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Transactions</span>
            <span className="text-white font-semibold">{stats.transactionsCount} orders</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drawer Reconciliation */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Expected Drawer Cash:</span>
              <span className="text-white font-bold font-['JetBrains_Mono']">
                ${expected.toFixed(2)}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 block">
                Actual Cash Counted ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3.5 py-2 text-base text-white font-['JetBrains_Mono'] focus:outline-yellow-500/50"
                  required
                />
              </div>
            </div>

            {/* Variance readout */}
            <div className="flex items-center justify-between text-sm pt-1 border-t border-white/5">
              <span className="text-slate-400">Cash Variance:</span>
              <span
                className={`font-bold font-['JetBrains_Mono'] flex items-center gap-1 ${
                  Math.abs(variance) < 0.01
                    ? 'text-emerald-400'
                    : variance > 0
                    ? 'text-teal-400'
                    : 'text-red-400'
                }`}
              >
                {Math.abs(variance) < 0.01 ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {variance >= 0 ? `+$${variance.toFixed(2)}` : `-$${Math.abs(variance).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300">
              Cashier Handover Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-yellow-500/50 resize-none"
            />
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-red-500 mt-0.5 focus:ring-0 cursor-pointer"
            />
            <span>
              I certify that all register totals have been counted and matched with the daily drawer.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Confirm & End Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
