'use client';

import React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { InventoryItem } from '../types';

export interface InventoryTableProps {
  items: InventoryItem[];
  totalFilteredCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectItem?: (item: InventoryItem) => void;
}

export default function InventoryTable({
  items,
  totalFilteredCount,
  currentPage,
  pageSize = 10,
  onPageChange,
  onSelectItem,
}: InventoryTableProps) {
  if (items.length === 0 && totalFilteredCount === 0) {
    return (
      <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-base">No inventory items found matching your filters.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-zinc-900 border-b border-white/10 text-white text-base font-semibold font-['Inter']">
              <th className="py-4 px-5">Item</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Current Stock</th>
              <th className="py-4 px-4">Level</th>
              <th className="py-4 px-4">Min / Max</th>
              <th className="py-4 px-4">Supplier</th>
              <th className="py-4 px-4">Last Updated</th>
              <th className="py-4 px-5 text-right">Status</th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-white/5">
            {items.map((item) => {
              const isCritical = item.status === 'Critical';
              const isLow = item.status === 'Low Stock';
              const isOut = item.status === 'Out of Stock';

              // Level bar color
              const levelBarColor = isCritical
                ? 'bg-red-500'
                : isLow
                ? 'bg-yellow-400'
                : isOut
                ? 'bg-transparent'
                : 'bg-green-500';

              // Status badge styling
              const statusBadgeStyle = isCritical
                ? 'bg-stone-900 border border-red-500/30 text-red-500'
                : isLow
                ? 'bg-yellow-950 border border-yellow-500/30 text-orange-400'
                : isOut
                ? 'bg-gray-900 border border-zinc-700 text-zinc-300'
                : 'bg-green-950 border border-green-500/30 text-green-400';

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectItem?.(item)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer text-sm font-['Inter']"
                >
                  {/* 1. Item Name with alert indicator */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      {(isCritical || isOut) && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                      <span className="text-white font-semibold text-sm">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* 2. Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[5px] text-white text-sm font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* 3. Current Stock */}
                  <td className="py-3.5 px-4 text-white font-medium">
                    {item.currentStock} {item.unit}
                  </td>

                  {/* 4. Level Bar */}
                  <td className="py-3.5 px-4">
                    <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${levelBarColor} transition-all duration-300`}
                        style={{ width: `${Math.min(item.levelPercent, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* 5. Min / Max */}
                  <td className="py-3.5 px-4 text-white font-medium">
                    {item.minStock} / {item.maxStock} {item.unit}
                  </td>

                  {/* 6. Supplier */}
                  <td className="py-3.5 px-4 text-white font-medium">
                    {item.supplier}
                  </td>

                  {/* 7. Last Updated */}
                  <td className="py-3.5 px-4 text-white/80 font-medium">
                    {item.lastUpdated}
                  </td>

                  {/* 8. Status Badge */}
                  <td className="py-3.5 px-5 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-[5px] text-sm font-medium ${statusBadgeStyle}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-zinc-900/90 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Info text */}
        <div className="text-sm text-zinc-400 font-['Inter']">
          Showing <span className="text-white font-medium">{startIndex}</span> to{' '}
          <span className="text-white font-medium">{endIndex}</span> of{' '}
          <span className="text-white font-medium">{totalFilteredCount}</span> items
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`h-8 px-2.5 rounded-lg border text-sm font-medium font-['Inter'] flex items-center gap-1 transition cursor-pointer ${
              currentPage <= 1
                ? 'opacity-40 border-white/10 text-zinc-500 cursor-not-allowed'
                : 'border-white/20 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`size-8 rounded-lg text-sm font-['Inter'] font-semibold transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={`h-8 px-2.5 rounded-lg border text-sm font-medium font-['Inter'] flex items-center gap-1 transition cursor-pointer ${
              currentPage >= totalPages
                ? 'opacity-40 border-white/10 text-zinc-500 cursor-not-allowed'
                : 'border-white/20 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
