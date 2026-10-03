'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, QrCode, Receipt, X } from 'lucide-react';
import { DashboardTable } from '../types';

interface ProcessPaymentModalProps {
  table: DashboardTable | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (tableId: string) => void;
}

export default function ProcessPaymentModal({
  table,
  isOpen,
  onClose,
  onPaymentComplete,
}: ProcessPaymentModalProps) {
  const [method, setMethod] = useState<'card' | 'cash' | 'qr'>('card');
  const [splitCount, setSplitCount] = useState<number>(2);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !table) return null;

  const total = parseFloat((table.billAmount || '$148.50').replace(/[^0-9.]/g, '')) || 148.5;
  const splitAmount = (total / splitCount).toFixed(2);

  return (
    <div
      className="fixed inset-0 new-dashbord-modal-backdrop bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[#16161a] border border-purple-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col space-y-5 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold font-['Inter']">
                Process Payment: {table.tableName}
              </h3>
              <p className="text-zinc-400 text-xs">
                Order {table.orderId || '#10582'} · {table.zone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="bg-[#1a1a1e] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Subtotal & Tax</span>
            <span className="text-white font-medium">${(total * 0.85).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Gratuity (18%)</span>
            <span className="text-white font-medium">${(total * 0.15).toFixed(2)}</span>
          </div>
          <div className="border-t border-zinc-800 pt-2 flex justify-between items-center">
            <span className="text-zinc-200 font-semibold">Total Amount</span>
            <span className="text-amber-400 text-xl font-bold font-mono">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Split Option */}
        <div className="bg-[#1e1e24] border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-300">Split Bill Receipt</div>
            <div className="text-[11px] text-zinc-400">${splitAmount} per person</div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setSplitCount(num)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  splitCount === num
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMethod('card')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              method === 'card'
                ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-medium">Terminal POS</span>
          </button>
          <button
            onClick={() => setMethod('cash')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              method === 'cash'
                ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-medium">Cash Tender</span>
          </button>
          <button
            onClick={() => setMethod('qr')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              method === 'qr'
                ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-xs font-medium">Guest QR Pay</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onPaymentComplete(table.id);
            onClose();
          }}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
        >
          Complete Settlement & Print Receipt
        </button>
      </div>
    </div>
  );
}
