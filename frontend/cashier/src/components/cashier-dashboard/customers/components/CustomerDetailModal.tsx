'use client';

import React from 'react';
import { X, Mail, Phone, ShoppingCart, Wallet, Calendar, Edit3 } from 'lucide-react';
import { CashierCustomer } from '../types';

interface CustomerDetailModalProps {
  customer: CashierCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: (customer: CashierCustomer) => void;
  onEditProfile: (customer: CashierCustomer) => void;
}

export default function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onNewOrder,
  onEditProfile,
}: CustomerDetailModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm bg-[#131315] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 font-['Inter'] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Avatar, Name, Tier Badge, Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customer.avatarUrl}
              alt={customer.name}
              className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md"
            />
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight font-['Inter']">
                {customer.name}
              </h2>
              <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-zinc-800/90 text-zinc-300 text-sm font-medium rounded-md border border-white/5">
                {customer.tier} Member
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Card with Icons */}
        <div className="bg-[#18181b]/80 border border-white/5 rounded-xl p-4.5 space-y-3.5">
          {/* Email */}
          <div className="flex items-center gap-3 text-base text-zinc-200">
            <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 text-base text-zinc-200">
            <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>{customer.phone}</span>
          </div>

          {/* Visits */}
          <div className="flex items-center gap-3 text-base text-zinc-200">
            <ShoppingCart className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>{customer.visits} visits</span>
          </div>

          {/* Total Spent */}
          <div className="flex items-center gap-3 text-base text-zinc-200">
            <Wallet className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>${customer.totalSpent.toLocaleString()} total spent</span>
          </div>

          {/* Last Visit */}
          <div className="flex items-center gap-3 text-base text-zinc-200">
            <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>Last visit: {customer.lastVisit}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onNewOrder(customer)}
            className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-amber-400/20"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>New Order</span>
          </button>

          <button
            type="button"
            onClick={() => onEditProfile(customer)}
            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-zinc-300" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
