'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { PaginationMeta } from '@tavonza/contracts';

export interface PaginationBarProps {
  meta?: PaginationMeta | {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationBar({
  meta,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}: PaginationBarProps) {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages } = meta;
  const startItem = Math.min(total, (page - 1) * limit + 1);
  const endItem = Math.min(total, page * limit);
  const hasPrevious = meta.hasPreviousPage ?? page > 1;
  const hasNext = meta.hasNextPage ?? page < totalPages;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#0d0d0f] border border-zinc-800 rounded-2xl text-xs text-zinc-400 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-zinc-200">{startItem}</strong>–
          <strong className="text-zinc-200">{endItem}</strong> of{' '}
          <strong className="text-zinc-200">{total}</strong> results
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-800 pl-3">
            <label htmlFor="manager-per-page-select" className="text-zinc-500 text-[11px]">
              Rows:
            </label>
            <select
              id="manager-per-page-select"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevious}
          title="First page"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          title="Previous page"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs font-medium text-zinc-300">
          Page <span className="font-bold text-amber-500">{page}</span> of{' '}
          <span className="font-bold text-zinc-200">{Math.max(1, totalPages)}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          title="Next page"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          title="Last page"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PaginationBar;
