'use client';

import React from 'react';
import { Receipt, X, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentItem } from '../types';

interface ReceiptModalProps {
  transaction: PaymentItem | null;
  onClose: () => void;
  onOpenRefund: (tx: PaymentItem) => void;
}

export function ReceiptModal({
  transaction,
  onClose,
  onOpenRefund,
}: ReceiptModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <Receipt className="size-5" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold">Payment Receipt</h3>
              <p className="text-xs text-neutral-400">{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Brand and Branch Header */}
          <div className="text-center pb-4 border-b border-dashed border-neutral-700 space-y-1">
            <div className="text-lg font-bold text-white tracking-wide">
              {transaction.restaurant}
            </div>
            <div className="text-xs text-neutral-400">
              {transaction.branch}
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">
              Order {transaction.orderNumber} · {transaction.tableNumber}
            </div>
          </div>

          {/* Server and Timestamp Details */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-neutral-800">
            <div>
              <span className="text-neutral-500 block">Server</span>
              <span className="text-neutral-200 font-medium">{transaction.server}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block">Date &amp; Time</span>
              <span className="text-neutral-200 font-medium">{transaction.timestamp}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Payment Method</span>
              <span className="text-neutral-200 font-medium">{transaction.method}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block">Status</span>
              <span
                className={`font-semibold ${
                  transaction.status === 'Completed'
                    ? 'text-emerald-400'
                    : transaction.status === 'Pending'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="space-y-2 py-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Ordered Items
            </div>
            <div className="space-y-1.5">
              {(transaction.items || [
                { name: 'Standard Chef Special', qty: 1, price: transaction.amount },
              ]).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300">
                    {item.qty}x {item.name}
                  </span>
                  <span className="text-white font-mono">
                    $ {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-3 border-t border-dashed border-neutral-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span className="font-mono text-neutral-300">
                $ {transaction.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Tax &amp; VAT (Included)</span>
              <span className="font-mono text-neutral-300">$ 0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
              <span>Total Paid</span>
              <span className="font-mono text-amber-400">
                {transaction.formattedAmount}
              </span>
            </div>
          </div>

          {/* Authorization Info */}
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
            <div className="flex justify-between">
              <span>Auth Code:</span>
              <span className="font-mono text-neutral-300">
                {transaction.authCode || 'N/A'}
              </span>
            </div>
            {transaction.cardLast4 && (
              <div className="flex justify-between">
                <span>Card Account:</span>
                <span className="font-mono text-neutral-300">
                  {transaction.cardBrand} •••• {transaction.cardLast4}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Terminal:</span>
              <span className="font-mono text-neutral-300">POS-01 / Gulshan Front Desk</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              toast.success('Sending print command to receipt printer POS-01');
            }}
            className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="size-3.5" />
            <span>Print Receipt</span>
          </button>

          {transaction.status === 'Completed' && (
            <button
              onClick={() => {
                onOpenRefund(transaction);
                onClose();
              }}
              className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>Refund</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
