'use client';

import React from 'react';
import { ChevronRight, CreditCard, Send } from 'lucide-react';
import { CheckoutTable } from '../types';

export interface CheckoutReadySectionProps {
  checkoutTables: CheckoutTable[];
  onSendToCashier?: () => void;
  onTablePayment?: (table: CheckoutTable) => void;
}

export default function CheckoutReadySection({
  checkoutTables,
  onSendToCashier,
  onTablePayment,
}: CheckoutReadySectionProps) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-slate-200 text-base sm:text-lg font-semibold font-['DM_Sans'] leading-tight">
              Checkout Ready
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['DM_Sans'] mt-0.5">
              Tables Ready for Payment
            </p>
          </div>

          <button
            type="button"
            onClick={onSendToCashier}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/25 text-slate-400 hover:text-white text-sm font-medium font-['DM_Sans'] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3 text-slate-400" />
            <span>Send to Cashier</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Table Matrix */}
        <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-neutral-900/40">
          {/* Header */}
          <div className="grid grid-cols-3 px-4 py-2.5 bg-neutral-800/60 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider font-['DM_Sans']">
            <div>Table</div>
            <div className="text-center">Amount</div>
            <div className="text-right">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {checkoutTables.map((item) => (
              <div
                key={item.id}
                onClick={() => onTablePayment?.(item)}
                className="grid grid-cols-3 px-4 py-3 text-sm text-slate-200 font-['DM_Mono'] hover:bg-white/[0.04] transition-colors cursor-pointer items-center"
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{item.tableNumber}</span>
                </div>
                <div className="text-center font-medium text-slate-200">
                  ${item.amount.toFixed(2)}
                </div>
                <div className="flex justify-end">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium font-['DM_Sans'] border ${item.statusBg} ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-500 flex items-center justify-between">
        <span>Station Checkout Total</span>
        <span className="text-white font-semibold font-['DM_Mono']">
          ${checkoutTables.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
