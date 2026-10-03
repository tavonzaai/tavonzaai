'use client';

import React from 'react';
import { X } from 'lucide-react';
import { CashierOrder } from '../types';

interface OrderDetailModalProps {
  order: CashierOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: CashierOrder['status']) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const statuses: CashierOrder['status'][] = ['Preparing', 'Ready', 'Paid', 'Cancelled'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-80 sm:w-96 p-5 bg-[#121214] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[30px] shadow-2xl space-y-4 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-slate-200 text-lg font-semibold leading-6">
            Order {order.orderNumber}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Grid Info Tiles */}
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] space-y-0.5">
            <div className="text-white text-xs font-normal leading-4">
              Table
            </div>
            <div className="text-neutral-300 text-sm font-semibold font-['Inter'] leading-4">
              {order.table}
            </div>
          </div>

          <div className="px-3 py-2 bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] space-y-0.5">
            <div className="text-white text-xs font-normal leading-4">
              Customer
            </div>
            <div className="text-neutral-300 text-sm font-medium font-['Inter'] leading-4 truncate">
              {order.customer}
            </div>
          </div>

          <div className="px-3 py-2 bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] space-y-0.5">
            <div className="text-white text-xs font-normal leading-4">
              Time
            </div>
            <div className="text-neutral-300 text-sm font-medium font-['Inter'] leading-4">
              {order.time}
            </div>
          </div>

          <div className="px-3 py-2 bg-white/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[30px] space-y-0.5">
            <div className="text-white text-xs font-normal leading-4">
              Payment
            </div>
            <div className="text-neutral-300 text-sm font-medium font-['Inter'] leading-4 truncate">
              {order.method}
            </div>
          </div>
        </div>

        {/* Update Status Section */}
        <div className="space-y-2 pt-1">
          <div className="text-white text-sm font-medium leading-4">
            Update Status
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {statuses.map((status) => {
              const isActive = order.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateStatus(order.id, status)}
                  className={`px-2 py-1 rounded-lg text-sm font-medium transition cursor-pointer text-center outline outline-1 outline-offset-[-1px] ${
                    isActive
                      ? status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-400 outline-emerald-500/50'
                        : status === 'Preparing'
                        ? 'bg-teal-500/20 text-teal-400 outline-teal-500/50'
                        : status === 'Ready'
                        ? 'bg-amber-500/20 text-amber-400 outline-amber-500/50'
                        : 'bg-rose-500/20 text-rose-400 outline-rose-500/50'
                      : 'bg-white/10 text-slate-400 hover:text-white outline-white/10 hover:bg-white/15'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info & Total */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-base font-normal text-white">
            <span>{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'} ·</span>
            <span
              className={`text-sm font-semibold ${
                order.status === 'Paid'
                  ? 'text-emerald-400'
                  : order.status === 'Preparing'
                  ? 'text-teal-400'
                  : order.status === 'Ready'
                  ? 'text-amber-400'
                  : order.status === 'Pending'
                  ? 'text-amber-500'
                  : 'text-rose-400'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="text-teal-400 text-xl font-bold font-['JetBrains_Mono'] leading-7">
            ${order.total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
