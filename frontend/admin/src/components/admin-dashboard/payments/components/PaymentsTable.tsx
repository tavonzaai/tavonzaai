'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentTransaction } from '../types';

export interface PaymentsTableProps {
  payments: PaymentTransaction[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  onSelectTransaction: (transaction: PaymentTransaction) => void;
}

export default function PaymentsTable({
  payments,
  currentPage,
  totalPages,
  itemsPerPage,
  totalResults,
  onPageChange,
  onSelectTransaction,
}: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500 bg-stone-950 border border-neutral-800 rounded-2xl">
        <p className="text-base">No transactions found matching your criteria.</p>
      </div>
    );
  }

  // Calculate page sum
  const pageTotal = payments.reduce((acc, p) => acc + p.amount, 0);

  // Pagination bounds
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="space-y-4 w-full">
      {/* Table Container */}
      <div className="w-full bg-stone-950 rounded-[10px] border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-zinc-900 border-b border-neutral-800 text-white text-base font-semibold font-['Inter']">
                <th className="py-4 px-5">Transaction</th>
                <th className="py-4 px-4">Order</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-4">Table</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Serve</th>
                <th className="py-4 px-4">Time</th>
                <th className="py-4 px-4">TIP</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Amount</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-neutral-800/80">
              {payments.map((txn) => {
                const isCompleted = txn.status === 'completed';
                const isRefunded = txn.status === 'refunded';
                const isPending = txn.status === 'Pending';

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer text-sm font-['Inter'] group"
                  >
                    {/* 1. Transaction */}
                    <td className="py-3.5 px-5 text-white text-sm font-semibold group-hover:text-amber-400 transition-colors">
                      {txn.id}
                    </td>

                    {/* 2. Order */}
                    <td className="py-3.5 px-4 text-white text-sm font-semibold">
                      {txn.orderId}
                    </td>

                    {/* 3. Customer */}
                    <td className="py-3.5 px-5 text-white text-sm font-medium">
                      {txn.customerName}
                    </td>

                    {/* 4. Table */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-white/5 rounded-[5px] text-white text-sm font-medium border border-white/5">
                        {txn.tableId}
                      </span>
                    </td>

                    {/* 5. Method */}
                    <td className="py-3.5 px-4 text-white text-sm font-medium">
                      {txn.method}
                    </td>

                    {/* 6. Serve */}
                    <td className="py-3.5 px-4 text-white text-sm font-medium">
                      {txn.server}
                    </td>

                    {/* 7. Time */}
                    <td className="py-3.5 px-4 text-white text-sm font-medium">
                      {txn.time}
                    </td>

                    {/* 8. TIP */}
                    <td className="py-3.5 px-4">
                      {txn.tipAmount > 0 ? (
                        <span className="text-green-500 text-sm font-medium">
                          +${txn.tipAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-sm font-mono">—</span>
                      )}
                    </td>

                    {/* 9. Status */}
                    <td className="py-3.5 px-4">
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-green-950 border border-green-500/30 text-green-400 text-sm font-medium rounded-[5px] capitalize">
                          completed
                        </span>
                      )}
                      {isRefunded && (
                        <span className="px-2 py-0.5 bg-stone-900 border border-red-500/20 text-red-500 text-sm font-medium rounded-[5px] capitalize">
                          refunded
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2 py-0.5 bg-yellow-950 border border-amber-500/30 text-orange-400 text-sm font-medium rounded-[5px] capitalize">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* 10. Amount */}
                    <td className="py-3.5 px-5 text-right text-white text-sm font-semibold">
                      ${txn.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Summary Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/90 border-t border-neutral-800 flex justify-end items-center">
          <div className="text-white text-lg font-bold font-['Inter']">
            Total : ${pageTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-zinc-400 text-base font-medium font-['Inter']">
          Showing {startIdx} to {endIdx} of {totalResults} results
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-md border border-neutral-700 hover:border-neutral-500 disabled:opacity-40 disabled:hover:border-neutral-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-md text-base font-medium font-['Inter'] transition cursor-pointer ${
                    isActive
                      ? 'border border-yellow-500 text-yellow-500 bg-yellow-500/10'
                      : 'border border-neutral-700 text-zinc-400 hover:text-white hover:border-neutral-500'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-md border border-neutral-700 hover:border-neutral-500 disabled:opacity-40 disabled:hover:border-neutral-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
