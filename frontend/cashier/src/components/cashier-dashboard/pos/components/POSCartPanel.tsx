'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, Printer, Split, Tag } from 'lucide-react';
import { POSCartItem } from '../types';
import { toast } from 'sonner';

interface POSCartPanelProps {
  selectedTable: string;
  cartItems: POSCartItem[];
  onIncrementItem: (productId: string) => void;
  onDecrementItem: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenProcessPayment: () => void;
  onOpenSplitBill: () => void;
  onPrintBill: () => void;
}

export default function POSCartPanel({
  selectedTable,
  cartItems,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem: _onRemoveItem,
  onClearCart,
  onOpenProcessPayment,
  onOpenSplitBill,
  onPrintBill,
}: POSCartPanelProps) {
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + tax;

  const handleApplyDiscount = () => {
    const val = parseFloat(discountPercent);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setAppliedDiscount(val);
      toast.success(`Applied ${val}% discount`);
    } else {
      toast.error('Enter a valid percentage between 0 and 100');
    }
  };

  const isEmpty = cartItems.length === 0;

  return (
    <div className="w-full lg:w-80 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col shadow-2xl overflow-hidden shrink-0 h-[765px]">
      {/* 1. Top Header */}
      <div className="h-16 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-white text-base font-bold font-['Plus_Jakarta_Sans'] leading-5">
            Order Cart
          </h2>
          <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-4">
            {selectedTable} · Walk-in
          </p>
        </div>

        {!isEmpty && (
          <button
            type="button"
            onClick={onClearCart}
            className="size-7 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
            title="Clear Cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Middle: Cart Items or Empty State */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5 flex flex-col">
        {isEmpty ? (
          <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-50 text-4xl font-normal font-['Inter'] leading-8 mb-3">
              🛒
            </div>
            <p className="text-white text-sm font-normal font-['Inter'] leading-5">
              Cart is empty
              <br />
              <span className="text-slate-400">Tap menu items to add</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 flex-1">
            {cartItems.map((cartItem) => (
              <div
                key={cartItem.product.id}
                className="h-14 p-3 bg-white/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl flex items-center gap-3"
              >
                {/* Emoji / Thumbnail */}
                <div className="text-slate-50 text-lg font-normal font-['Inter'] leading-7 shrink-0">
                  {cartItem.product.emoji || '🍽️'}
                </div>

                {/* Name & Unit Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold font-['Inter'] leading-4 truncate">
                    {cartItem.product.name}
                  </h4>
                  <div className="text-yellow-500 text-sm font-normal font-['Inter'] leading-4">
                    ${cartItem.product.price.toFixed(2)}
                  </div>
                </div>

                {/* Counter [-] qty [+] */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDecrementItem(cartItem.product.id)}
                    className="size-6 bg-neutral-700 hover:bg-neutral-600 rounded-lg flex items-center justify-center text-slate-200 transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-5 text-center text-white text-sm font-bold font-['Inter'] leading-4">
                    {cartItem.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onIncrementItem(cartItem.product.id)}
                    className="size-6 bg-yellow-500 hover:bg-yellow-400 rounded-lg flex items-center justify-center text-white transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discount Section (Only when cart is not empty) */}
        {!isEmpty && (
          <div className="pt-2 border-t border-white/5 flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Discount %"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="flex-1 h-7 px-2.5 py-1 bg-white/10 rounded-[5px] backdrop-blur-[30px] text-sm text-white placeholder:text-neutral-500 outline-none border border-white/5 focus:border-amber-500/40 font-['Plus_Jakarta_Sans']"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="h-7 px-3 py-1 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 hover:bg-white/10 text-slate-200 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center gap-1 cursor-pointer transition"
            >
              <Tag className="w-3 h-3" />
              <span>Apply</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Financial Summary & Actions */}
      <div className="p-3.5 border-t border-slate-800 space-y-3 shrink-0 bg-neutral-900">
        <div className="space-y-1.5 text-sm font-normal font-['Inter']">
          <div className="flex justify-between items-center text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {appliedDiscount > 0 && (
            <div className="flex justify-between items-center text-emerald-400">
              <span>Discount ({appliedDiscount}%)</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-400">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-white text-base font-bold pt-1 border-t border-white/10">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Process Payment Button */}
        <button
          type="button"
          disabled={isEmpty}
          onClick={onOpenProcessPayment}
          className={`w-full h-10 rounded-[10px] text-base font-bold font-['Inter'] leading-5 transition-all cursor-pointer flex items-center justify-center shadow-lg ${
            isEmpty
              ? 'bg-white/10 text-white/50 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-400 text-white hover:shadow-yellow-500/20'
          }`}
        >
          Process Payment
        </button>

        {/* Dual Actions: Split Bill & Print */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isEmpty}
            onClick={onOpenSplitBill}
            className={`h-8 px-3 py-1.5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition ${
              isEmpty
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'text-slate-200 hover:bg-white/5 cursor-pointer'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>Split Bill</span>
          </button>

          <button
            type="button"
            disabled={isEmpty}
            onClick={onPrintBill}
            className={`h-8 px-3 py-1.5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 text-sm font-medium font-['Plus_Jakarta_Sans'] flex items-center justify-center gap-1.5 transition ${
              isEmpty
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'text-slate-200 hover:bg-white/5 cursor-pointer'
            }`}
          >
            <Printer className="w-3 h-3" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
