'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { LiveOrder } from '../types';

export interface LiveOrdersSectionProps {
  orders: LiveOrder[];
  onViewAll?: () => void;
  onSelectOrder?: (order: LiveOrder) => void;
}

export default function LiveOrdersSection({
  orders,
  onViewAll,
  onSelectOrder,
}: LiveOrdersSectionProps) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              Live Orders
            </h3>
            <p className="text-zinc-400 text-sm font-normal font-['Inter'] mt-0.5">
              Order Status
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Orders Queue Table */}
        <div className="mt-4 border border-white/10 rounded-xl overflow-hidden bg-neutral-900/40">
          {/* Table Header */}
          <div className="grid grid-cols-4 px-3.5 py-2.5 bg-neutral-800/60 border-b border-white/10 text-xs font-semibold text-white font-['Inter']">
            <div>Order</div>
            <div className="text-center">Table</div>
            <div className="text-center">Status</div>
            <div className="text-right">ETA</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder?.(order)}
                className="grid grid-cols-4 px-3.5 py-2.5 text-sm text-slate-200 font-['Inter'] hover:bg-white/[0.04] transition-colors cursor-pointer items-center"
              >
                <div className="font-semibold text-slate-200">{order.orderNumber}</div>
                <div className="text-center text-slate-300">{order.tableNumber}</div>
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${order.statusBg} ${order.statusColor}`}>
                    {order.statusText}
                  </span>
                </div>
                <div className={`text-right font-medium text-xs ${
                  order.eta === 'Ready'
                    ? 'text-emerald-400 font-bold'
                    : order.eta === 'Done'
                    ? 'text-zinc-400'
                    : 'text-amber-400'
                }`}>
                  {order.eta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-400 flex items-center justify-between">
        <span>Active Kitchen Queue</span>
        <span className="font-semibold text-white">{orders.length} Active Orders</span>
      </div>
    </div>
  );
}
