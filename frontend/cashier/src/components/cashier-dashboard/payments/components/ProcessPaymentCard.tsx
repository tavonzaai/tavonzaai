'use client';

import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode } from 'lucide-react';
import { PaymentMode, PaymentMethodOption } from '../types';
import { toast } from 'sonner';

interface ProcessPaymentCardProps {
  onProcessSuccess: (orderRef: string, amount: number, method: string) => void;
  onRefundSuccess: (orderRef: string, amount: number, method: string) => void;
}

export default function ProcessPaymentCard({
  onProcessSuccess,
  onRefundSuccess,
}: ProcessPaymentCardProps) {
  const [mode, setMode] = useState<PaymentMode>('process');
  const [orderRef, setOrderRef] = useState('#10590');
  const [amount, setAmount] = useState('2');
  const [method, setMethod] = useState<PaymentMethodOption>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const methodName = method === 'card' ? 'Visa Card' : method === 'cash' ? 'Cash' : 'QR Payment';

      if (mode === 'process') {
        toast.success(`Payment of $${numAmount.toFixed(2)} processed for ${orderRef} via ${methodName}!`);
        onProcessSuccess(orderRef, numAmount, methodName);
      } else {
        toast.success(`Refund of $${numAmount.toFixed(2)} issued for ${orderRef} via ${methodName}!`);
        onRefundSuccess(orderRef, numAmount, methodName);
      }
    }, 600);
  };

  return (
    <div className="w-full bg-white/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[29.4px] p-5 sm:p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      {/* Mode Switcher Tabs */}
      <div className="w-full h-10 p-0.5 bg-black/40 rounded-lg border border-yellow-500/25 flex items-center mb-5">
        <button
          type="button"
          onClick={() => setMode('process')}
          className={`flex-1 h-full rounded-md text-base font-medium transition-all flex items-center justify-center cursor-pointer ${
            mode === 'process'
              ? 'bg-white text-black shadow-sm font-semibold'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Process Payment
        </button>
        <button
          type="button"
          onClick={() => setMode('refund')}
          className={`flex-1 h-full rounded-md text-base font-medium transition-all flex items-center justify-center cursor-pointer ${
            mode === 'refund'
              ? 'bg-white text-black shadow-sm font-semibold'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Refund
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Reference */}
        <div>
          <label className="block text-white text-sm font-medium mb-1.5 font-sans">
            Order Reference
          </label>
          <input
            type="text"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            placeholder="#10590"
            className="w-full h-9 px-3 bg-zinc-900/80 rounded-[5px] border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter'] transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-white text-sm font-medium mb-1.5 font-sans">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base font-normal">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-9 pl-7 pr-3 bg-zinc-900/80 rounded-[5px] border border-white/10 text-slate-200 text-base font-semibold focus:outline-none focus:border-amber-400 font-['Inter'] transition-colors"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-white text-sm font-medium mb-1.5 font-sans">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Card */}
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'card'
                  ? 'bg-yellow-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-zinc-900/40 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span className="text-xs font-medium font-sans">Card</span>
            </button>

            {/* Cash */}
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'cash'
                  ? 'bg-yellow-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-zinc-900/40 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <Banknote className="w-4 h-4 text-white" />
              <span className="text-xs font-medium font-sans">Cash</span>
            </button>

            {/* QR */}
            <button
              type="button"
              onClick={() => setMethod('qr')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                method === 'qr'
                  ? 'bg-yellow-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-zinc-900/40 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <QrCode className="w-4 h-4 text-white" />
              <span className="text-xs font-medium font-sans">QR</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {mode === 'process' ? (
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-amber-500/20 font-['Inter'] disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>{isProcessing ? 'Processing...' : 'Process Payment'}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-10 bg-zinc-900 border border-white/15 hover:bg-zinc-800 text-zinc-200 font-medium text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer font-['Inter'] disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-zinc-300" />
              <span>{isProcessing ? 'Processing...' : 'Issue Refund'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
