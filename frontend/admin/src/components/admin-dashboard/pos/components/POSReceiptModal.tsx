'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
} from 'lucide-react';
import { POSTransaction } from '../types';

export interface POSReceiptModalProps {
  isOpen: boolean;
  transaction: POSTransaction | null;
  onClose: () => void;
}

export default function POSReceiptModal({
  isOpen,
  transaction,
  onClose,
}: POSReceiptModalProps) {
  const [modalStep, setModalStep] = useState<'confirm' | 'success'>('confirm');

  // Reset modal step whenever transaction opens
  useEffect(() => {
    if (isOpen) {
      setModalStep('confirm');
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const getMethodIcon = () => {
    switch (transaction.paymentMethod) {
      case 'Cash':
        return <Banknote className="w-5 h-5 text-zinc-300" />;
      case 'Mobile':
        return <Smartphone className="w-5 h-5 text-zinc-300" />;
      default:
        return <CreditCard className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* STEP 1: CONFIRM PAYMENT */}
        {modalStep === 'confirm' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Confirm Payment
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Box 1: Payment Method & Table */}
            <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-zinc-700/80 border border-zinc-600/40 flex items-center justify-center shrink-0 shadow-inner">
                  {getMethodIcon()}
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Payment Method</p>
                  <p className="text-base font-bold text-white leading-tight mt-0.5">
                    {transaction.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-400 font-medium">Table</p>
                <p className="text-base font-bold text-white leading-tight mt-0.5">
                  {transaction.table}
                </p>
              </div>
            </div>

            {/* Box 2: Total Amount in Green */}
            <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-base text-zinc-300 font-medium">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-emerald-400">
                ${transaction.total.toFixed(2)}
              </span>
            </div>

            {/* Step 1 Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-semibold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setModalStep('success')}
                className="py-3 bg-amber-400 hover:bg-amber-300 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-400/20 transition cursor-pointer"
              >
                Charge ${transaction.total.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT SUCCESSFUL */}
        {modalStep === 'success' && (
          <div className="py-2 space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Yellow Checkmark Badge */}
            <div className="size-14 rounded-full bg-amber-400/10 border-2 border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/10">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                Payment Successful!
              </h3>
              <p className="text-sm text-zinc-400">
                Table {transaction.table} • {transaction.paymentMethod}
              </p>
            </div>

            {/* Big Amount */}
            <div className="text-4xl font-bold text-amber-400 tracking-tight">
              ${transaction.total.toFixed(2)}
            </div>

            {/* Note */}
            <p className="text-sm text-zinc-400 px-3 leading-relaxed">
              Order receipt has been printed and table status updated.
            </p>

            {/* Full-width CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 rounded-xl text-base font-bold text-white shadow-lg shadow-amber-400/20 transition cursor-pointer"
              >
                New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
