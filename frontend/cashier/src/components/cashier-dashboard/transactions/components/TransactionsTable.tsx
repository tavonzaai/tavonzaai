'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { TransactionItem } from '../types';

interface TransactionsTableProps {
  transactions: TransactionItem[];
  onSelectTransaction: (tx: TransactionItem) => void;
}

export default function TransactionsTable({
  transactions,
  onSelectTransaction,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="w-full bg-stone-950 rounded-[10px] border border-zinc-800 p-12 text-center">
        <p className="text-zinc-500 text-base font-['Inter']">No transactions match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-950 rounded-[10px] border border-zinc-800 overflow-hidden shadow-lg">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[950px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-base font-semibold font-['Inter'] h-14">
              <th className="px-6 py-4">TX ID</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Cashier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-800 font-['Inter']">
            {transactions.map((tx) => {
              const isPaid = tx.status === 'Paid';
              const isFailed = tx.status === 'Failed';
              const isPending = tx.status === 'Pending';

              return (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-zinc-900/50 transition-colors cursor-pointer group h-14"
                >
                  {/* TX ID */}
                  <td className="px-6 py-4 text-white text-sm font-medium whitespace-nowrap">
                    {tx.txId}
                  </td>

                  {/* Order */}
                  <td className="px-6 py-4 text-neutral-300 text-sm font-medium whitespace-nowrap">
                    {tx.orderNumber}
                  </td>

                  {/* Method */}
                  <td className="px-6 py-4 text-slate-200 text-sm font-medium whitespace-nowrap">
                    {tx.method}
                  </td>

                  {/* Cashier */}
                  <td className="px-6 py-4 text-white text-sm font-medium whitespace-nowrap">
                    {tx.cashier}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        isPaid
                          ? 'text-teal-400'
                          : isFailed
                          ? 'text-red-500'
                          : isPending
                          ? 'text-amber-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                      isFailed ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    ${tx.amount.toFixed(2)}
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4 text-white text-sm font-medium whitespace-nowrap">
                    {tx.time}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-white/70 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
