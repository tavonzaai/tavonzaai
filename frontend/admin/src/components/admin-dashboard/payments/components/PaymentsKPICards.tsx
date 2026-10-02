'use client';

import React from 'react';
import { CreditCard, DollarSign, Receipt, PieChart } from 'lucide-react';
import { PaymentTransaction } from '../types';

export interface PaymentsKPICardsProps {
  payments: PaymentTransaction[];
}

export default function PaymentsKPICards({ payments }: PaymentsKPICardsProps) {
  // Completed transactions
  const completedTxns = payments.filter((p) => p.status === 'completed');
  const completedTotalAmount = completedTxns.reduce((acc, p) => acc + p.amount, 0);
  const totalTips = payments.reduce((acc, p) => acc + p.tipAmount, 0);
  const avgTransaction =
    completedTxns.length > 0 ? completedTotalAmount / completedTxns.length : 0;

  // Payment methods counts
  const totalCount = payments.length || 1;
  const cardCount = payments.filter((p) => p.method === 'Card').length;
  const digitalCount = payments.filter((p) => p.method === 'Digital').length;
  const cashCount = payments.filter((p) => p.method === 'Cash').length;

  const cardPercent = Math.round((cardCount / totalCount) * 100);
  const digitalPercent = Math.round((digitalCount / totalCount) * 100);
  const cashPercent = 100 - cardPercent - digitalPercent;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Today's Revenue */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            $12,840
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            Today&apos;s Revenue
          </div>
          <div className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
            +12.8%
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 2. Total Tips */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            ${totalTips.toFixed(0)}
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            Total Tips
          </div>
          <div className="text-zinc-400 text-xs font-medium font-['Inter'] leading-4">
            18% avg tip rate
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 3. Avg Transaction */}
      <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            ${avgTransaction.toFixed(2)}
          </div>
          <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5">
            Avg Transaction
          </div>
          <div className="text-zinc-400 text-xs font-medium font-['Inter'] leading-4">
            {completedTxns.length} completed txns
          </div>
        </div>
        <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <Receipt className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* 4. Payment Methods Breakdown */}
      <div className="h-32 p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Card */}
          <div className="flex items-center justify-between text-sm font-['Inter']">
            <span className="text-neutral-300 text-sm">Card</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${cardPercent}%` }}
                />
              </div>
              <span className="text-neutral-200 text-sm font-medium w-7 text-right">
                {cardPercent}%
              </span>
            </div>
          </div>

          {/* Digital */}
          <div className="flex items-center justify-between text-sm font-['Inter']">
            <span className="text-neutral-300 text-sm">Digital</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${digitalPercent}%` }}
                />
              </div>
              <span className="text-neutral-200 text-sm font-medium w-7 text-right">
                {digitalPercent}%
              </span>
            </div>
          </div>

          {/* Cash */}
          <div className="flex items-center justify-between text-sm font-['Inter']">
            <span className="text-neutral-300 text-sm">Cash</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${cashPercent}%` }}
                />
              </div>
              <span className="text-neutral-200 text-sm font-medium w-7 text-right">
                {cashPercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-neutral-400 text-sm font-medium font-['Inter'] pt-1 border-t border-white/5">
          Payment Methods
        </div>
      </div>
    </div>
  );
}
