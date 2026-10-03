'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { CashierCustomer } from '../types';

interface CustomersTableProps {
  customers: CashierCustomer[];
  onSelectCustomer: (customer: CashierCustomer) => void;
}

export default function CustomersTable({
  customers,
  onSelectCustomer,
}: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="w-full bg-white/5 rounded-[10px] border border-white/10 p-12 text-center backdrop-blur-lg">
        <p className="text-zinc-500 text-base font-['Inter']">No customers match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden shadow-lg">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-base font-semibold font-['Inter'] h-16">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Visits</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Last Visit</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-800 font-['Inter']">
            {customers.map((cust) => {
              const isGold = cust.tier === 'Gold';
              const isSilver = cust.tier === 'Silver';

              return (
                <tr
                  key={cust.id}
                  onClick={() => onSelectCustomer(cust)}
                  className="hover:bg-zinc-900/50 transition-colors cursor-pointer group h-14"
                >
                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cust.avatarUrl}
                        alt={cust.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <span className="text-white text-sm font-semibold">
                        {cust.name}
                      </span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 text-white text-sm font-semibold whitespace-nowrap">
                    {cust.email}
                  </td>

                  {/* Visits */}
                  <td className="px-6 py-4 text-slate-200 text-sm font-medium font-mono whitespace-nowrap">
                    {cust.visits}
                  </td>

                  {/* Total Spent */}
                  <td className="px-6 py-4 text-teal-500 text-sm font-semibold font-mono whitespace-nowrap">
                    ${cust.totalSpent.toLocaleString()}
                  </td>

                  {/* Last Visit */}
                  <td className="px-6 py-4 text-white text-sm font-bold whitespace-nowrap">
                    {cust.lastVisit}
                  </td>

                  {/* Tier */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                        isGold
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : isSilver
                          ? 'bg-gray-600/20 text-slate-300'
                          : 'bg-orange-700/20 text-orange-600'
                      }`}
                    >
                      {cust.tier}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCustomer(cust);
                      }}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-white/70 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
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
