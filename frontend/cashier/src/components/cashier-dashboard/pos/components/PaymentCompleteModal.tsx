'use client';

import React from 'react';
import { Check, Printer, X } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tableNumber: string;
  paymentMethod: PaymentMethod;
  onPrintReceipt: () => void;
}

export default function PaymentCompleteModal({
  isOpen,
  onClose,
  totalAmount,
  tableNumber,
  paymentMethod,
  onPrintReceipt,
}: PaymentCompleteModalProps) {
  if (!isOpen) return null;

  const methodLabel =
    paymentMethod === 'card'
      ? 'Card'
      : paymentMethod === 'cash'
      ? 'Cash'
      : 'QR / Digital';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-80 sm:w-96 bg-[#121214] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-xl shadow-2xl p-6 space-y-4 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-slate-200 text-base font-bold leading-5">
            Payment Complete
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Icon */}
        <div className="py-2 flex flex-col items-center justify-center text-center space-y-2">
          <div className="size-14 bg-green-500/20 rounded-full flex items-center justify-center text-emerald-400 shadow-inner">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h4 className="text-slate-200 text-lg font-bold leading-6">
            Payment Successful!
          </h4>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-3.5 bg-gray-900/60 rounded-2xl border border-white/5 space-y-2 font-['Plus_Jakarta_Sans'] text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white font-normal">{methodLabel}</span>
            <span className="text-slate-200 font-medium capitalize">{tableNumber}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            <span className="text-white font-normal">Amount</span>
            <span className="text-amber-500 font-medium text-base">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onPrintReceipt}
            className="h-9 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/20 text-slate-200 text-sm font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-[5px] text-white text-sm font-semibold flex items-center justify-center transition shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
