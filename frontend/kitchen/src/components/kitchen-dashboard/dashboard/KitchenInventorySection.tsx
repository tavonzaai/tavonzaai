'use client';

import React from 'react';
import { Package, ArrowRight, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { mockKitchenInventory } from '../data';
import { toast } from 'sonner';

export default function KitchenInventorySection() {
  const getBadge = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Running Low':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'In Stock':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'bg-red-500';
      case 'Running Low':
        return 'bg-yellow-500';
      case 'In Stock':
        return 'bg-emerald-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="h-full p-6 bg-white/[0.04] rounded-2xl outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white font-['Inter']">Kitchen Inventory</h3>
            <p className="text-sm text-zinc-400 font-normal">Smart Stock & Auto-Depletion</p>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Inventory manager opened. Full stock levels synchronized.')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 text-sm font-medium font-['DM_Sans'] transition-all cursor-pointer"
          >
            <span>View Inventory</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* Inventory Item Rows */}
        <div className="mt-4 space-y-2.5">
          {mockKitchenInventory.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/5 backdrop-blur-lg flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${getDotColor(item.stockStatus)}`} />
                <div>
                  <div className="text-sm font-normal text-white font-['Inter']">{item.name}</div>
                  <div className="text-xs text-zinc-400 font-mono">{item.quantity}</div>
                </div>
              </div>

              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border ${getBadge(item.stockStatus)}`}>
                {item.stockStatus}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm text-zinc-500">
        <span>Low-stock automated supplier dispatch enabled</span>
        <button
          type="button"
          onClick={() => toast.success('Inventory counts re-synced with POS.')}
          className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync Stock</span>
        </button>
      </div>
    </div>
  );
}
