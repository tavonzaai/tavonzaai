'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { InventoryItem } from '../types';

export interface InventoryAttentionBannerProps {
  items: InventoryItem[];
  onReorderAll: () => void;
}

export default function InventoryAttentionBanner({
  items,
  onReorderAll,
}: InventoryAttentionBannerProps) {
  const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length;
  const criticalCount = items.filter((i) => i.status === 'Critical').length;

  if (outOfStockCount === 0 && criticalCount === 0) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-white/5 rounded-[5px] border border-white/20 backdrop-blur-[10.20px] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="size-5 flex items-center justify-center text-red-500 shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-sm font-['Inter'] leading-5">
          <span className="text-red-500 font-bold">Attention required — </span>
          <span className="text-red-400 font-medium">
            {outOfStockCount} item{outOfStockCount !== 1 ? 's' : ''} out of stock,{' '}
            {criticalCount} item{criticalCount !== 1 ? 's' : ''} critically low.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReorderAll}
        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-semibold font-['Inter'] transition cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reorder</span>
      </button>
    </div>
  );
}
