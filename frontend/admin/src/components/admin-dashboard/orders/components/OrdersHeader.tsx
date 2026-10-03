'use client';

import React from 'react';
import { Download, Plus } from 'lucide-react';

export interface OrdersHeaderProps {
  onExport: () => void;
  onOpenNewOrder: () => void;
}

export default function OrdersHeader({ onExport, onOpenNewOrder }: OrdersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-8">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Orders
        </h1>
        <p className="text-zinc-500 text-lg font-normal font-['Inter'] leading-6 mt-1">
          Manage and monitor all customer orders in real time.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Export Button */}
        <button
          onClick={onExport}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-[10px] border border-gray-200/20 flex items-center gap-2 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* New Order Button */}
        <button
          onClick={onOpenNewOrder}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,1.00)] flex items-center gap-2 text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>New Order</span>
        </button>
      </div>
    </div>
  );
}
