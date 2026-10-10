'use client';

import React from 'react';
import { RotateCcw, X, CheckCircle2 } from 'lucide-react';

interface BatchSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSettlement: () => void;
}

export function BatchSettlementModal({
  isOpen,
  onClose,
  onConfirmSettlement,
}: BatchSettlementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold">Execute Batch Settlement</h3>
              <p className="text-xs text-neutral-400">Gulshan Flagship Daily Cutoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-neutral-300">
            Trigger an on-demand payout clearance for un-settled card authorizations and online QR payments.
          </p>

          <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Pending Amount:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">$ 5,000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Batched Transactions:</span>
              <span className="text-white font-medium">24 authorizations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Destination Account:</span>
              <span className="text-white font-mono">Standard Chartered Bank (SCB) •••• 8821</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Est. Arrival:</span>
              <span className="text-emerald-400 font-medium">Within 30 minutes (Fast Payout)</span>
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
            onClick={onConfirmSettlement}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="size-3.5 text-neutral-950" />
            <span>Confirm Settlement</span>
          </button>
        </div>
      </div>
    </div>
  );
}
