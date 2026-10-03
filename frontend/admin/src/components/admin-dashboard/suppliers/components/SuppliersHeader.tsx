'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export interface SuppliersHeaderProps {
  onOpenAddModal: () => void;
}

export default function SuppliersHeader({ onOpenAddModal }: SuppliersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Suppliers
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Manage your supplier relationships and orders.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="h-10 px-4 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-[10px] shadow-lg shadow-yellow-500/20 flex items-center gap-1.5 transition text-white text-sm font-semibold font-['Inter'] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Supplier</span>
        </button>
      </div>
    </div>
  );
}
