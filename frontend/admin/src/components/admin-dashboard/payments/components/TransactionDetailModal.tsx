'use client';

import React from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  RotateCcw,
  User,
  Utensils,
} from 'lucide-react';
import { PaymentTransaction } from '../types';
import { toast } from 'sonner';

export interface TransactionDetailModalProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund?: (id: string) => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onRefund,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    toast.success(`Printing receipt for ${transaction.id}...`);
  };

  const handleRefundClick = () => {
    if (transaction.status === 'refunded') {
      toast.error('Transaction already refunded');
      return;
    }
    onRefund?.(transaction.id);
    toast.success(`Refund of $${transaction.amount.toFixed(2)} processed for ${transaction.id}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#18181b]/95 border border-white/20 rounded-2xl backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl font-bold font-['Plus_Jakarta_Sans'] leading-6">
                {transaction.id}
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                  transaction.status === 'completed'
                    ? 'bg-green-950 text-green-400 border border-green-500/30'
                    : transaction.status === 'refunded'
                    ? 'bg-stone-900 text-red-500 border border-red-500/30'
                    : 'bg-yellow-950 text-orange-400 border border-amber-500/30'
                }`}
              >
                {transaction.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-0.5">
              Order {transaction.orderId} · Table {transaction.tableId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* 6 Glass Info Rows */}
        <div className="space-y-2 text-sm font-['Inter']">
          {/* Customer */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <User className="w-3.5 h-3.5 text-white/80" />
              <span>Customer</span>
            </div>
            <span className="text-white font-semibold">{transaction.customerName}</span>
          </div>

          {/* Payment Method */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <CreditCard className="w-3.5 h-3.5 text-white/80" />
              <span>Method</span>
            </div>
            <span className="text-white font-semibold">{transaction.method}</span>
          </div>

          {/* Server */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Utensils className="w-3.5 h-3.5 text-white/80" />
              <span>Server</span>
            </div>
            <span className="text-white font-semibold">{transaction.server}</span>
          </div>

          {/* Timestamp */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-white/80" />
              <span>Time</span>
            </div>
            <span className="text-white font-semibold">{transaction.time}</span>
          </div>

          {/* Tip Amount */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Tip Amount</span>
            </div>
            <span className="text-green-500 font-semibold">
              {transaction.tipAmount > 0
                ? `+$${transaction.tipAmount.toFixed(2)}`
                : '—'}
            </span>
          </div>

          {/* Total Amount */}
          <div className="h-10 px-3.5 bg-yellow-500/10 rounded-[5px] border border-yellow-500/20 flex items-center justify-between">
            <span className="text-yellow-400 font-medium">Total Paid</span>
            <span className="text-white text-base font-bold">
              ${transaction.amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 rounded-[5px] text-white text-sm font-semibold font-['Inter'] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          {transaction.status !== 'refunded' ? (
            <button
              type="button"
              onClick={handleRefundClick}
              className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.99] border border-red-500/30 rounded-[5px] text-red-400 text-sm font-bold font-['Inter'] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund</span>
            </button>
          ) : (
            <div className="py-2.5 px-3 bg-stone-900 rounded-[5px] text-zinc-500 text-sm font-medium font-['Inter'] flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Refunded</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
