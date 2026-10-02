'use client';

import React from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Minus,
  Plus,
  Trash2,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import { POSCartItem, PaymentMethod } from '../types';

export interface POSCartPanelProps {
  selectedTable: string;
  cartItems: POSCartItem[];
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  onIncrementItem: (productId: string) => void;
  onDecrementItem: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onChargeOrder: () => void;
}

export default function POSCartPanel({
  selectedTable,
  cartItems,
  paymentMethod,
  setPaymentMethod,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onClearCart,
  onChargeOrder,
}: POSCartPanelProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="w-full lg:w-80 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col shadow-2xl overflow-hidden shrink-0 h-full max-h-full">
      {/* 1. Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-white text-base font-bold font-['Plus_Jakarta_Sans'] leading-5">
            Order — {selectedTable}
          </h2>
          <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-4 mt-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
          </p>
        </div>
        {totalItems > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            title="Clear Cart"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Cart Items List / Empty State */}
      <div className="p-3.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col justify-start">
        {cartItems.length === 0 ? (
          <div className="my-auto py-8 flex flex-col justify-center items-center text-center">
            <div className="size-12 mb-3 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-white text-sm font-normal font-['Inter'] leading-4 max-w-[200px]">
              Tap menu items to add them to the order
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3 bg-zinc-800/90 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 flex items-center justify-between gap-3 shadow-md transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Dish Thumbnail */}
                  <div className="size-9 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-white truncate leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-xs text-amber-400 font-semibold mt-0.5">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDecrementItem(product.id)}
                    className="size-7 rounded-full bg-zinc-700/80 hover:bg-zinc-600 text-zinc-200 flex items-center justify-center font-bold text-sm cursor-pointer transition shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-white w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrementItem(product.id)}
                    className="size-7 rounded-full bg-amber-400 hover:bg-amber-300 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Calculations & Payment Footer */}
      <div className="p-4 border-t border-slate-800 bg-neutral-950/40 space-y-3.5">
        {/* Financial Rows */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-white text-base font-bold pt-1 border-t border-zinc-800">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card */}
          <button
            type="button"
            onClick={() => setPaymentMethod('Card')}
            className={`py-2 rounded-[10px] flex flex-col justify-center items-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'Card'
                ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 font-semibold'
                : 'border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Card</span>
          </button>

          {/* Cash */}
          <button
            type="button"
            onClick={() => setPaymentMethod('Cash')}
            className={`py-2 rounded-[10px] flex flex-col justify-center items-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'Cash'
                ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 font-semibold'
                : 'border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Cash</span>
          </button>

          {/* Mobile */}
          <button
            type="button"
            onClick={() => setPaymentMethod('Mobile')}
            className={`py-2 rounded-[10px] flex flex-col justify-center items-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'Mobile'
                ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 font-semibold'
                : 'border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Mobile</span>
          </button>
        </div>

        {/* Charge Button */}
        <button
          type="button"
          disabled={cartItems.length === 0}
          onClick={onChargeOrder}
          className={`w-full h-11 rounded-[10px] text-center text-base font-bold font-['Inter'] transition-all cursor-pointer flex items-center justify-center shadow-lg ${
            cartItems.length > 0
              ? 'bg-yellow-500 hover:bg-yellow-400 text-white shadow-yellow-500/20'
              : 'bg-yellow-500/40 text-white/50 cursor-not-allowed'
          }`}
        >
          Charge ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
