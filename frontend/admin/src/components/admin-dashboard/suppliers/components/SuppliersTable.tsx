'use client';

import React from 'react';
import { Supplier } from '../types';

export interface SuppliersTableProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
}

export default function SuppliersTable({
  suppliers,
  onSelectSupplier,
}: SuppliersTableProps) {
  if (suppliers.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-base">No suppliers found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-zinc-900 border-b border-white/10 text-white text-base font-semibold font-['Inter']">
              <th className="py-4 px-6">Supplier</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5">Reliability</th>
              <th className="py-4 px-5">Last Order</th>
              <th className="py-4 px-6">Next Delivery</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-white/5">
            {suppliers.map((supplier) => {
              const isActive = supplier.status === 'Active';

              return (
                <tr
                  key={supplier.id}
                  onClick={() => onSelectSupplier(supplier)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer text-sm font-['Inter'] group"
                >
                  {/* 1. Supplier Name & Contact */}
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-white text-sm font-semibold font-['Inter'] leading-5 group-hover:text-amber-400 transition-colors">
                        {supplier.name}
                      </div>
                      <div className="text-slate-500 text-xs font-normal font-['Inter'] leading-3 mt-0.5">
                        {supplier.contactPerson}
                      </div>
                    </div>
                  </td>

                  {/* 2. Category */}
                  <td className="py-4 px-5 text-white text-sm font-semibold font-['Inter'] leading-5">
                    {supplier.category}
                  </td>

                  {/* 3. Status */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-block px-3 py-1 rounded-[5px] text-sm font-medium ${
                        isActive
                          ? 'bg-green-950 border border-green-500/30 text-green-400'
                          : 'bg-white/5 border border-white/10 text-gray-400'
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>

                  {/* 4. Reliability */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${supplier.reliabilityPercent}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                        {supplier.reliabilityPercent}%
                      </span>
                    </div>
                  </td>

                  {/* 5. Last Order */}
                  <td className="py-4 px-5 text-white text-sm font-bold font-['Inter'] leading-5">
                    {supplier.lastOrder}
                  </td>

                  {/* 6. Next Delivery */}
                  <td className="py-4 px-6 text-white text-sm font-semibold font-['Inter'] leading-5">
                    {supplier.nextDelivery}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
