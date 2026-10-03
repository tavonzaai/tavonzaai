'use client';

import React from 'react';
import { Download, Plus } from 'lucide-react';

export interface InventoryHeaderProps {
  onOpenAddModal: () => void;
  onExportCSV: () => void;
}

export default function InventoryHeader({
  onOpenAddModal,
  onExportCSV,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Inventory
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Track stock levels and manage your ingredient supply.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        {/* Export Button */}
        <button
          type="button"
          onClick={onExportCSV}
          className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-[10px] border border-white/20 backdrop-blur-[10.20px] flex items-center gap-1.5 transition text-white text-sm font-semibold font-['Inter'] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 rounded-[10px] shadow-lg shadow-yellow-500/20 flex items-center gap-1.5 transition text-white text-sm font-semibold font-['Inter'] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
}
