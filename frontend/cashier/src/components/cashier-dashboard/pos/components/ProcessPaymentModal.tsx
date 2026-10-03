'use client';

import React from 'react';
import { CreditCard, Banknote, QrCode, X, Check } from 'lucide-react';
import { PaymentMethod } from '../types';

interface ProcessPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tableNumber: string;
  itemsCount: number;
  selectedMethod: PaymentMethod;
  setSelectedMethod: (method: PaymentMethod) => void;
  onConfirmPayment: () => void;
}

export default function ProcessPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  tableNumber,
  itemsCount,
  selectedMethod,
  setSelectedMethod,
  onConfirmPayment,
}: ProcessPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-80 sm:w-96 bg-[#121214] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-xl shadow-2xl p-5 space-y-4 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-3">
          <div className="pr-2">
            <h3 className="text-slate-200 text-base font-bold leading-5">
              Process Payment
            </h3>
            <p className="text-slate-500 text-sm font-normal leading-4 mt-0.5">
              Select payment method to complete the transaction
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 bg-white/0 hover:bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-center text-yellow-500 transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Amount Due teal card */}
        <div className="w-full py-3.5 px-4 bg-teal-500/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-teal-500/20 text-center space-y-1">
          <div className="text-white text-sm font-normal">
            Total Amount Due
          </div>
          <div className="text-teal-400 text-4xl font-bold font-['JetBrains_Mono'] leading-8">
            ${totalAmount.toFixed(2)}
          </div>
          <div className="text-gray-400 text-xs font-normal">
            {tableNumber} · {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <div className="text-white text-xs font-semibold uppercase leading-4 tracking-wide">
            Payment Method
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Card */}
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-2.5 rounded-[5px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer outline outline-1 outline-offset-[-1px] ${
                selectedMethod === 'card'
                  ? 'bg-yellow-500/20 outline-amber-500/40 text-white'
                  : 'bg-gray-900/30 outline-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-medium leading-4">Card</span>
            </button>

            {/* Cash */}
            <button
              type="button"
              onClick={() => setSelectedMethod('cash')}
              className={`p-2.5 rounded-[5px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer outline outline-1 outline-offset-[-1px] ${
                selectedMethod === 'cash'
                  ? 'bg-yellow-500/20 outline-amber-500/40 text-white'
                  : 'bg-gray-900/30 outline-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-medium leading-4">Cash</span>
            </button>

            {/* QR / Digital */}
            <button
              type="button"
              onClick={() => setSelectedMethod('qr')}
              className={`p-2.5 rounded-[5px] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer outline outline-1 outline-offset-[-1px] ${
                selectedMethod === 'qr'
                  ? 'bg-yellow-500/20 outline-amber-500/40 text-white'
                  : 'bg-gray-900/30 outline-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-xs font-medium leading-4">QR / Digital</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 text-white text-sm font-semibold transition cursor-pointer flex items-center justify-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirmPayment}
            className="h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-[5px] text-white text-sm font-semibold inline-flex justify-center items-center gap-1.5 transition shadow-md cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Confirm Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
