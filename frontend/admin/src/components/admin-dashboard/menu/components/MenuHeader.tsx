'use client';

import React from 'react';
import { Plus, RotateCw } from 'lucide-react';
import { MenuItem } from '../types';

export interface MenuHeaderProps {
  items: MenuItem[];
  onOpenAddModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function MenuHeader({
  items,
  onOpenAddModal,
  onRefresh,
  isRefreshing = false,
}: MenuHeaderProps) {
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.isActive).length;
  const hiddenCount = totalCount - activeCount;

  // Calculate dynamic stats from actual database items
  const avgMargin =
    items.length > 0
      ? Math.round(
          items.reduce((acc, curr) => acc + (curr.marginPercent || 0), 0) /
            items.length
        )
      : 0;

  const totalCatalogValue = items.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const formattedCatalogValue =
    totalCatalogValue >= 1000
      ? `$${(totalCatalogValue / 1000).toFixed(1)}k`
      : `$${totalCatalogValue.toFixed(2)}`;

  return (
    <div className="space-y-6 w-full">
      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
            Menu Management
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-normal font-['Inter'] leading-6 mt-1">
            Real-time backend synchronized items, pricing categories, and availability.
          </p>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-10 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl flex items-center gap-2 transition-all cursor-pointer text-sm font-medium"
              title="Sync with backend database"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Sync API</span>
            </button>
          )}

          {/* Add Item CTA Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm font-['Inter'] rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Items */}
        <div className="p-4 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-neutral-800 flex flex-col justify-between h-20">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {totalCount < 10 ? `0${totalCount}` : totalCount}
          </div>
          <div>
            <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
              Total Menu Items
            </div>
            <div className="text-zinc-500 text-xs font-medium font-['Inter'] leading-3">
              {activeCount} Active in Database
            </div>
          </div>
        </div>

        {/* Active Items */}
        <div className="p-4 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-neutral-800 flex flex-col justify-between h-20">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {activeCount < 10 ? `0${activeCount}` : activeCount}
          </div>
          <div>
            <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
              Active (Visible)
            </div>
            <div className="text-zinc-500 text-xs font-medium font-['Inter'] leading-3">
              {hiddenCount < 10 ? `0${hiddenCount}` : hiddenCount} Hidden from Guests
            </div>
          </div>
        </div>

        {/* Catalog Value */}
        <div className="p-4 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-neutral-800 flex flex-col justify-between h-20">
          <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
            {formattedCatalogValue}
          </div>
          <div>
            <div className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-4">
              Catalog Value
            </div>
            <div className="text-zinc-500 text-xs font-medium font-['Inter'] leading-3">
              Sum of active base prices
            </div>
          </div>
        </div>

        {/* Avg Margin */}
        <div className="p-4 bg-neutral-900 rounded-xl shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border border-neutral-800 flex flex-col justify-between h-20">
          <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-5">
            {avgMargin}%
          </div>
          <div>
            <div className="text-stone-300 text-sm font-semibold font-['Inter'] leading-4">
              Avg Profit Margin
            </div>
            <div className="text-zinc-500 text-xs font-medium font-['Inter'] leading-3">
              Computed from item costs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
