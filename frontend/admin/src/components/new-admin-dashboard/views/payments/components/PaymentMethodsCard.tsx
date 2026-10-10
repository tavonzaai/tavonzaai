'use client';

import React from 'react';
import { CreditCard, Banknote, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethodsCardProps {
  onViewAllMethods?: () => void;
}

export function PaymentMethodsCard({ onViewAllMethods }: PaymentMethodsCardProps) {
  return (
    <div className="lg:col-span-7 p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-5">
      {/* Section Header */}
      <div className="py-1 border-b border-zinc-900 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="text-white text-lg font-semibold font-sans">
            Payment Methods
          </div>
          <div className="text-neutral-400 text-xs font-normal font-sans leading-5">
            Revenue distribution this month
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Gulshan POS &amp; Terminals</span>
        </div>
      </div>

      {/* Method 1: Card */}
      <div className="flex items-center gap-3.5 py-1">
        <div className="w-12 text-zinc-100 text-sm font-normal font-sans leading-4 tracking-tight flex items-center gap-1.5">
          <CreditCard className="size-3.5 text-neutral-400" />
          <span>Card</span>
        </div>

        {/* Progress Bar Container */}
        <div className="flex-1 h-1.5 relative bg-neutral-700/60 rounded-[999px] overflow-hidden">
          <div
            className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
            style={{ width: '70%' }}
          />
        </div>

        {/* Stats */}
        <div className="w-28 flex justify-between items-center shrink-0">
          <div className="text-zinc-100 text-sm font-bold font-sans leading-4 tracking-tight">
            $ 1.22M
          </div>
          <div className="text-neutral-400 text-xs font-normal font-sans leading-4 tracking-tight">
            70%
          </div>
        </div>
      </div>

      <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-900" />

      {/* Method 2: Cash */}
      <div className="flex items-center gap-3.5 py-1">
        <div className="w-12 text-zinc-100 text-sm font-normal font-sans leading-4 tracking-tight flex items-center gap-1.5">
          <Banknote className="size-3.5 text-neutral-400" />
          <span>Cash</span>
        </div>

        {/* Progress Bar Container */}
        <div className="flex-1 h-1.5 relative bg-neutral-700/60 rounded-[999px] overflow-hidden">
          <div
            className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
            style={{ width: '30%' }}
          />
        </div>

        {/* Stats */}
        <div className="w-28 flex justify-between items-center shrink-0">
          <div className="text-zinc-100 text-sm font-bold font-sans leading-4 tracking-tight">
            $ 20K
          </div>
          <div className="text-neutral-400 text-xs font-normal font-sans leading-4 tracking-tight">
            30%
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="mt-2 pt-3 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Card Settlement: <strong>T+1 Payout</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Cash Reconciled: <strong>$20,000 Verified</strong></span>
          </div>
        </div>
        <button
          onClick={() => {
            if (onViewAllMethods) onViewAllMethods();
            toast.info('Viewing all payment methods');
          }}
          className="text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1 transition-colors"
        >
          <span>View Channel Ledger</span>
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
