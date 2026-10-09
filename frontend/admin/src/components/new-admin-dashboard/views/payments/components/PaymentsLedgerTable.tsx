'use client';

import React from 'react';
import {
  Search,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentItem } from '../types';

interface PaymentsLedgerTableProps {
  transactions: PaymentItem[];
  filteredTransactions: PaymentItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterMethod: string;
  onFilterMethodChange: (m: string) => void;
  filterStatus: string;
  onFilterStatusChange: (s: string) => void;
  onSelectTransaction: (tx: PaymentItem) => void;
  onOpenRefund: (tx: PaymentItem) => void;
}

export function PaymentsLedgerTable({
  transactions,
  filteredTransactions,
  searchQuery,
  onSearchChange,
  filterMethod,
  onFilterMethodChange,
  filterStatus,
  onFilterStatusChange,
  onSelectTransaction,
  onOpenRefund,
}: PaymentsLedgerTableProps) {
  return (
    <div className="bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 p-6 space-y-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-white text-lg font-semibold font-sans">
            All Transactions Ledger
          </h2>
          <p className="text-neutral-400 text-xs font-sans mt-0.5">
            Audited payment records, card authorizations, and cash drawer reconciliations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search TX ID, order, table, server..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Method */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-neutral-500 hidden sm:inline">Method:</span>
            {['All', 'Card', 'Cash', 'Stripe', 'QR Pay'].map((method) => (
              <button
                key={method}
                onClick={() => onFilterMethodChange(method)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 ${
                  filterMethod === method
                    ? 'bg-amber-400 text-neutral-950 font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500 hidden sm:inline">Status:</span>
            {['All', 'Completed', 'Pending', 'Refunded'].map((st) => (
              <button
                key={st}
                onClick={() => onFilterStatusChange(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 ${
                  filterStatus === st
                    ? 'bg-neutral-100 text-neutral-950 font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="pb-3 font-semibold">Transaction ID</th>
              <th className="pb-3 font-semibold">Branch &amp; Table</th>
              <th className="pb-3 font-semibold">Order</th>
              <th className="pb-3 font-semibold">Server</th>
              <th className="pb-3 font-semibold">Method</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-neutral-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-neutral-950/40 transition-colors group"
                >
                  <td className="py-3.5">
                    <button
                      onClick={() => onSelectTransaction(t)}
                      className="font-mono text-zinc-100 font-bold hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{t.id}</span>
                    </button>
                  </td>
                  <td className="py-3.5">
                    <span className="text-white font-medium block">{t.branch}</span>
                    <span className="text-[10px] text-neutral-400">{t.tableNumber}</span>
                  </td>
                  <td className="py-3.5 text-neutral-300 font-medium">
                    {t.orderNumber}
                  </td>
                  <td className="py-3.5 text-neutral-300">
                    {t.server}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 font-mono text-[10px] inline-flex items-center gap-1">
                      {t.method === 'Card' ? (
                        <CreditCard className="size-3 text-neutral-400" />
                      ) : t.method === 'Cash' ? (
                        <Banknote className="size-3 text-emerald-400" />
                      ) : (
                        <DollarSign className="size-3 text-amber-400" />
                      )}
                      <span>{t.method}</span>
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-white">
                    {t.formattedAmount}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                        t.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : t.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'Completed'
                            ? 'bg-emerald-400'
                            : t.status === 'Pending'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-neutral-400">
                    {t.timestamp}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectTransaction(t)}
                        title="View Receipt"
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      >
                        <Receipt className="size-3.5" />
                      </button>
                      {t.status === 'Completed' && (
                        <button
                          onClick={() => onOpenRefund(t)}
                          title="Issue Refund"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-400 transition-colors"
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div>
          Showing <span className="text-white font-medium">{filteredTransactions.length}</span> of <span className="text-white font-medium">{transactions.length}</span> recorded transactions
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Navigating to previous page')}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Previous
          </button>
          <span className="text-neutral-500 px-1">Page 1 of 1</span>
          <button
            onClick={() => toast.info('Navigating to next page')}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
