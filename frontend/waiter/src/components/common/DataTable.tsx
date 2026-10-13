'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  className = '',
}: DataTableProps<T>) {
  const getSortIcon = (key: string) => {
    if (sortBy !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
    );
  };

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0f] shadow-lg ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-900/60 text-zinc-400 font-semibold tracking-wide uppercase text-[11px]">
              {columns.map((col) => {
                const isSortable = col.sortable && onSort;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`py-3.5 px-4 ${alignClass} ${col.className || ''} ${
                      isSortable
                        ? 'cursor-pointer select-none hover:text-white transition-colors'
                        : ''
                    }`}
                    onClick={() => isSortable && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSortable && getSortIcon(col.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse bg-zinc-900/20">
                  {columns.map((_col, cIdx) => (
                    <td key={`loading-cell-${cIdx}`} className="py-4 px-4">
                      <div className="h-4 bg-zinc-800/70 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center text-zinc-500">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <p className="text-zinc-400 font-medium">No records found</p>
                      <p className="text-zinc-600 text-[11px]">
                        Try adjusting your search or active filters.
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const rowKey = keyExtractor
                  ? keyExtractor(item, idx)
                  : item.id || `row-${idx}`;

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors duration-150 ${
                      onRowClick ? 'cursor-pointer hover:bg-zinc-800/40' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      const content = col.render
                        ? col.render(item, idx)
                        : item[col.key] !== undefined && item[col.key] !== null
                        ? String(item[col.key])
                        : '—';

                      return (
                        <td
                          key={`cell-${rowKey}-${col.key}`}
                          className={`py-3.5 px-4 text-zinc-200 ${alignClass} ${col.className || ''}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
