'use client';

import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProceedToPayment: (splitCount: number, perPersonAmount: number) => void;
}

export default function SplitBillModal({
  isOpen,
  onClose,
  totalAmount,
  onProceedToPayment,
}: SplitBillModalProps) {
  const [splitCount, setSplitCount] = useState(2);

  if (!isOpen) return null;

  const perPersonAmount = totalAmount / splitCount;

  const handleIncrement = () => {
    setSplitCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setSplitCount((prev) => (prev > 2 ? prev - 1 : 2));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-80 sm:w-96 bg-[#121214] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-xl shadow-2xl p-5 space-y-4 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-slate-200 text-base font-bold leading-5">
            Split Bill
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

        {/* Total to split header row */}
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-200 text-lg font-bold">Total to split</span>
          <span className="text-teal-400 text-lg sm:text-xl font-bold font-['JetBrains_Mono']">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Split Between Controls */}
        <div className="space-y-2">
          <span className="text-neutral-400 text-sm font-medium">Split between</span>

          <div className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={splitCount <= 2}
              className={`size-8 rounded-lg flex items-center justify-center transition ${
                splitCount <= 2
                  ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 text-center text-slate-200 text-3xl font-bold font-['JetBrains_Mono']">
              {splitCount}
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              className="size-8 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center justify-center text-white font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Each Person Pays Calculation Box */}
        <div className="p-3 bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 space-y-1">
          <div className="text-white text-sm font-normal font-['Inter']">
            Each person pays
          </div>
          <div className="text-slate-200 text-2xl font-bold font-['JetBrains_Mono'] leading-7">
            ${perPersonAmount.toFixed(2)}
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <button
          type="button"
          onClick={() => onProceedToPayment(splitCount, perPersonAmount)}
          className="w-full h-10 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-[5px] text-white text-sm font-bold transition shadow-md cursor-pointer flex items-center justify-center mt-2"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
