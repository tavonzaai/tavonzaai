'use client';

import React from 'react';
import { X, Printer, RotateCcw } from 'lucide-react';
import { TransactionItem } from '../types';
import { toast } from 'sonner';

interface TransactionDetailModalProps {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueRefund: (txId: string) => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onIssueRefund,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrintReceipt = () => {
    toast.success(`Printing receipt for Transaction ${transaction.txId}...`);
    window.print?.();
  };

  const isPaid = transaction.status === 'Paid';
  const isFailed = transaction.status === 'Failed';
  const isPending = transaction.status === 'Pending';

  return (
    <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="w-full max-w-md bg-[#131315] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 font-['Inter'] animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold font-['Inter']">
            Transaction {transaction.txId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Grid Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Order */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-['Inter']">
              Order
            </label>
            <div className="w-full h-10 px-3 bg-zinc-900/90 border border-white/10 rounded-lg flex items-center text-white text-base font-normal">
              {transaction.orderNumber}
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-['Inter']">
              Method
            </label>
            <div className="w-full h-10 px-3 bg-zinc-900/90 border border-white/10 rounded-lg flex items-center text-white text-base font-normal">
              {transaction.method}
            </div>
          </div>

          {/* Cashier */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-['Inter']">
              Cashier
            </label>
            <div className="w-full h-10 px-3 bg-zinc-900/90 border border-white/10 rounded-lg flex items-center text-white text-base font-normal">
              {transaction.cashier}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-['Inter']">
              Time
            </label>
            <div className="w-full h-10 px-3 bg-zinc-900/90 border border-white/10 rounded-lg flex items-center text-white text-base font-normal">
              {transaction.time}
            </div>
          </div>
        </div>

        {/* Amount & Status Banner */}
        <div
          className={`rounded-xl p-4 flex items-center justify-between border ${
            isPaid
              ? 'bg-[#0a231c] border-emerald-500/30'
              : isFailed
              ? 'bg-[#2a0e12] border-red-500/30'
              : isPending
              ? 'bg-[#261d08] border-amber-500/30'
              : 'bg-[#1f1026] border-purple-500/30'
          }`}
        >
          <div>
            <span
              className={`text-sm font-medium block mb-0.5 ${
                isPaid
                  ? 'text-emerald-400/70'
                  : isFailed
                  ? 'text-red-400/70'
                  : isPending
                  ? 'text-amber-400/70'
                  : 'text-purple-400/70'
              }`}
            >
              Amount
            </span>
            <span className="text-white text-3xl font-bold font-['Inter'] tracking-tight">
              ${transaction.amount.toFixed(2)}
            </span>
          </div>

          <span
            className={`text-lg font-semibold font-['Inter'] ${
              isPaid
                ? 'text-emerald-400'
                : isFailed
                ? 'text-red-400'
                : isPending
                ? 'text-amber-400'
                : 'text-purple-400'
            }`}
          >
            {transaction.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium font-['Inter'] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            disabled={transaction.status === 'Refunded'}
            onClick={() => onIssueRefund(transaction.id)}
            className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium font-['Inter'] transition-colors cursor-pointer ${
              transaction.status === 'Refunded'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-[#251014] border-red-500/30 text-red-400 hover:bg-red-950/60'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>{transaction.status === 'Refunded' ? 'Refunded' : 'Issue Refund'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
