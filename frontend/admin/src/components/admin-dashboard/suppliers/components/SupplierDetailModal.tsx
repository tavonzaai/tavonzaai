'use client';

import React from 'react';
import {
  X,
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Boxes,
  ShoppingCart,
  History,
} from 'lucide-react';
import { Supplier } from '../types';

export interface SupplierDetailModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPlaceOrder: (supplier: Supplier) => void;
  onOpenOrderHistory: (supplier: Supplier) => void;
}

export default function SupplierDetailModal({
  supplier,
  isOpen,
  onClose,
  onOpenPlaceOrder,
  onOpenOrderHistory,
}: SupplierDetailModalProps) {
  if (!isOpen || !supplier) return null;

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
            <h3 className="text-white text-xl font-bold font-['Plus_Jakarta_Sans'] leading-6">
              {supplier.name}
            </h3>
            <p className="text-gray-400 text-sm font-normal font-['Inter'] mt-0.5">
              {supplier.contactPerson}
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

        {/* 7 Glass Info Rows */}
        <div className="space-y-2 text-sm font-['Inter']">
          {/* 1. Category */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Package className="w-3.5 h-3.5 text-white/80" />
              <span>Category</span>
            </div>
            <span className="text-white font-semibold">{supplier.category}</span>
          </div>

          {/* 2. Phone */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Phone className="w-3.5 h-3.5 text-white/80" />
              <span>Phone</span>
            </div>
            <span className="text-white font-semibold">{supplier.phone}</span>
          </div>

          {/* 3. Email */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Mail className="w-3.5 h-3.5 text-white/80" />
              <span>Email</span>
            </div>
            <span className="text-white font-semibold truncate max-w-[180px]">
              {supplier.email}
            </span>
          </div>

          {/* 4. Location */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span>Location</span>
            </div>
            <span className="text-white font-semibold">{supplier.location}</span>
          </div>

          {/* 5. Last Order */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-white/80" />
              <span>Last Order</span>
            </div>
            <span className="text-white font-semibold">{supplier.lastOrder}</span>
          </div>

          {/* 6. Reliability */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
              <span>Reliability</span>
            </div>
            <span className="text-white font-semibold">
              {supplier.reliabilityPercent}%
            </span>
          </div>

          {/* 7. Products */}
          <div className="h-10 px-3.5 bg-white/5 rounded-[5px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-neutral-400">
              <Boxes className="w-3.5 h-3.5 text-white/80" />
              <span>Products</span>
            </div>
            <span className="text-white font-semibold">
              {supplier.productsCount} items
            </span>
          </div>
        </div>

        {/* Bottom 2 Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {/* Place Order */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPlaceOrder(supplier);
            }}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 rounded-[5px] text-white text-sm font-semibold font-['Inter'] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Place Order</span>
          </button>

          {/* View History */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenOrderHistory(supplier);
            }}
            className="py-2.5 px-3 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-[5px] text-white text-sm font-bold font-['Inter'] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-yellow-500/20"
          >
            <History className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}
