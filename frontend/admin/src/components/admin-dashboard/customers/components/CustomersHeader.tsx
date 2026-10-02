'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export interface CustomersHeaderProps {
  onAddCustomer: () => void;
}

export default function CustomersHeader({
  onAddCustomer,
}: CustomersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9 tracking-tight">
          Customers
        </h1>
        <p className="text-zinc-400 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Manage your customer base and loyalty insights.
        </p>
      </div>

      {/* Add Customer Button */}
      <button
        type="button"
        onClick={onAddCustomer}
        className="h-9 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white font-semibold text-sm rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,0.80)] inline-flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Add Customer</span>
      </button>
    </div>
  );
}
