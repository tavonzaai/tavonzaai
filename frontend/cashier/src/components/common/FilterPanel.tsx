'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  badge?: number | string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  selectedValue?: string;
}

export interface FilterPanelProps {
  groups: FilterGroup[];
  onFilterChange: (groupId: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export function FilterPanel({
  groups,
  onFilterChange,
  onReset,
  className = '',
}: FilterPanelProps) {
  const hasActiveFilters = groups.some(
    (g) => g.selectedValue && g.selectedValue !== '' && g.selectedValue !== 'ALL' && g.selectedValue !== 'all'
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 bg-[#0d0d0f] border border-zinc-800 rounded-2xl ${className}`}
    >
      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium px-1">
        <Filter className="w-3.5 h-3.5 text-amber-500" />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-2 py-1">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">{group.label}:</span>
            <div className="flex items-center gap-1">
              {group.options.map((opt) => {
                const isSelected =
                  (group.selectedValue || 'ALL').toUpperCase() === opt.value.toUpperCase();

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onFilterChange(group.id, opt.value)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    {opt.label}
                    {opt.badge !== undefined && (
                      <span className="ml-1 text-[10px] opacity-75">({opt.badge})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors ml-auto px-2 py-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export default FilterPanel;
