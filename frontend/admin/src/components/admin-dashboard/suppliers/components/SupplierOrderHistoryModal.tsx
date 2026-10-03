'use client';

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Supplier, SupplierHistoryOrder } from '../types';

export interface SupplierOrderHistoryModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SupplierOrderHistoryModal({
  supplier,
  isOpen,
  onClose,
}: SupplierOrderHistoryModalProps) {
  if (!isOpen || !supplier) return null;

  // Fallback orders if none specified
  const historyOrders: SupplierHistoryOrder[] =
    supplier.orderHistory && supplier.orderHistory.length > 0
      ? supplier.orderHistory
      : [
          {
            id: 'ORD-8821',
            date: 'Jul 12, 2025',
            itemsCount: 8,
            totalAmount: 1240,
            status: 'Delivered',
          },
          {
            id: 'ORD-8714',
            date: 'Jun 28, 2025',
            itemsCount: 6,
            totalAmount: 980,
            status: 'Delivered',
          },
          {
            id: 'ORD-8603',
            date: 'Jun 14, 2025',
            itemsCount: 10,
            totalAmount: 1560,
            status: 'Delivered',
          },
          {
            id: 'ORD-8491',
            date: 'May 30, 2025',
            itemsCount: 7,
            totalAmount: 1120,
            status: 'Delivered',
          },
          {
            id: 'ORD-8380',
            date: 'May 16, 2025',
            itemsCount: 9,
            totalAmount: 1380,
            status: 'Delivered',
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#18181b]/95 border border-white/20 rounded-2xl backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans'] leading-6">
              Order History
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['Inter'] mt-0.5">
              {supplier.name}
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

        {/* Order History Cards List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
          {historyOrders.map((order) => (
            <div
              key={order.id}
              className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-lg flex items-center justify-between hover:bg-white/[0.08] transition-colors"
            >
              {/* Left: ID and Date/Items */}
              <div>
                <div className="text-white text-base font-semibold font-['Inter'] leading-5">
                  {order.id}
                </div>
                <div className="text-slate-500 text-sm font-normal font-['Inter'] leading-4 mt-0.5">
                  {order.date} · {order.itemsCount} items
                </div>
              </div>

              {/* Right: Amount and Delivered status */}
              <div className="text-right">
                <div className="text-green-500 text-base font-bold font-['Inter'] leading-5">
                  ${order.totalAmount.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 text-xs font-semibold font-['Inter'] leading-4">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-white/5 text-slate-400 text-base font-medium font-['Inter'] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
