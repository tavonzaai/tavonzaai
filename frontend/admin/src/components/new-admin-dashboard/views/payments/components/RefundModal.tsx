'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { PaymentItem } from '../types';

interface RefundModalProps {
  refundTarget: PaymentItem | null;
  onClose: () => void;
  onConfirmRefund: (tx: PaymentItem, reason: string) => void;
  isRefunding: boolean;
}

export function RefundModal({
  refundTarget,
  onClose,
  onConfirmRefund,
  isRefunding,
}: RefundModalProps) {
  const [refundReason, setRefundReason] = useState<string>('Customer Request');

  if (!refundTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="size-5" />
            <h3 className="text-white text-base font-semibold">Issue Refund</h3>
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
            Are you sure you want to refund this transaction? The amount will be reversed to the customer’s payment method.
          </p>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Transaction ID:</span>
              <span className="text-white font-mono font-bold">{refundTarget.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Amount to Refund:</span>
              <span className="text-rose-400 font-mono font-bold">{refundTarget.formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Method:</span>
              <span className="text-white">{refundTarget.method}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400 font-medium">Select Refund Reason</label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full h-9 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="Customer Request">Customer Request</option>
              <option value="Incorrect Charge / Duplication">Incorrect Charge / Duplication</option>
              <option value="Item Unavailable (86)">Item Unavailable (86)</option>
              <option value="Manager Goodwill Comp">Manager Goodwill Comp</option>
            </select>
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
            onClick={() => onConfirmRefund(refundTarget, refundReason)}
            disabled={isRefunding}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isRefunding ? 'Processing...' : `Confirm Refund (${refundTarget.formattedAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
