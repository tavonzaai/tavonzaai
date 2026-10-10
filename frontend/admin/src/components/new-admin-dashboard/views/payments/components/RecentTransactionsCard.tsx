'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { PaymentItem } from '../types';

interface RecentTransactionsCardProps {
  transactions: PaymentItem[];
  onSelectTransaction: (tx: PaymentItem) => void;
}

export function RecentTransactionsCard({
  transactions,
  onSelectTransaction,
}: RecentTransactionsCardProps) {
  return (
    <div className="lg:col-span-5 px-6 py-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-900 pb-3">
        <div className="text-white text-lg font-semibold font-sans">
          Recent Transactions
        </div>
        <div className="text-neutral-400 text-xs font-normal font-sans leading-5">
          Latest completed payments
        </div>
      </div>

      {/* List of 4 Transactions */}
      <div className="flex flex-col gap-3">
        {transactions.slice(0, 4).map((tx, idx) => (
          <React.Fragment key={tx.id}>
            <div
              onClick={() => onSelectTransaction(tx)}
              className="group flex justify-between items-center py-1 hover:bg-neutral-800/40 px-2 rounded-lg -mx-2 transition-colors cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-100 text-base font-bold font-sans leading-5 group-hover:text-amber-300 transition-colors">
                    {tx.id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                    {tx.tableNumber}
                  </span>
                </div>
                <div className="text-neutral-500 text-xs font-normal font-sans leading-4">
                  {tx.method} · {tx.timestamp}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-white text-base font-medium font-sans leading-5">
                  {tx.formattedAmount}
                </div>
                <Eye className="size-4 text-neutral-500 group-hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {idx < 3 && (
              <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-900" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
