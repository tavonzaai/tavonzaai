'use client';

import React from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Customer } from '../types';

export interface CustomersTableProps {
  customers: Customer[];
  currentPage: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onViewCustomer: (customer: Customer) => void;
}

export default function CustomersTable({
  customers,
  currentPage,
  itemsPerPage = 10,
  onPageChange,
  onViewCustomer,
}: CustomersTableProps) {
  const getSegmentBadge = (segment: Customer['segment']) => {
    switch (segment) {
      case 'VIP':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'Regular':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'New':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  const totalResults = customers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);

  const startIdx = totalResults === 0 ? 0 : (validPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(validPage * itemsPerPage, totalResults);
  const paginatedCustomers = customers.slice(
    (validPage - 1) * itemsPerPage,
    validPage * itemsPerPage
  );

  return (
    <div className="w-full space-y-4">
      {/* Table Container */}
      <div className="w-full bg-stone-950 rounded-[10px] border border-zinc-800 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden font-['Inter']">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="h-14 bg-zinc-900 border-b border-zinc-800 text-white text-base font-semibold">
                <th className="pl-6 pr-4 py-3">Customer</th>
                <th className="px-4 py-3 text-center">Segment</th>
                <th className="px-4 py-3 text-center">Visit</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-center">Last Visit</th>
                <th className="pl-4 pr-6 py-3 text-center">Status</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/80">
              {paginatedCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  className="h-[58px] hover:bg-white/[0.02] transition-colors"
                >
                  {/* 1. Customer Name + Email */}
                  <td className="pl-6 pr-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-semibold leading-5">
                        {cust.name}
                      </span>
                      <span className="text-gray-400 text-sm font-normal leading-4">
                        {cust.email}
                      </span>
                    </div>
                  </td>

                  {/* 2. Segment */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-semibold ${getSegmentBadge(
                        cust.segment
                      )}`}
                    >
                      {cust.segment}
                    </span>
                  </td>

                  {/* 3. Visit */}
                  <td className="px-4 py-3 text-center text-white text-sm font-medium">
                    {cust.visits}
                  </td>

                  {/* 4. Total Spent */}
                  <td className="px-4 py-3 text-right text-white text-sm font-medium font-mono">
                    ${cust.totalSpent.toLocaleString()}
                  </td>

                  {/* 5. Rating */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1 text-amber-500 text-sm font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{cust.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* 6. Last Visit */}
                  <td className="px-4 py-3 text-center text-white text-sm font-medium">
                    {cust.lastVisit}
                  </td>

                  {/* 7. Status Action (View) */}
                  <td className="pl-4 pr-6 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onViewCustomer(cust)}
                      className="h-6 px-3 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-[5px] transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 px-1 font-['Inter']">
        <div className="text-zinc-400 text-sm font-medium">
          Showing <span className="text-white font-semibold">{startIdx}</span> to{' '}
          <span className="text-white font-semibold">{endIdx}</span> of{' '}
          <span className="text-white font-semibold">{totalResults}</span> customers
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, validPage - 1))}
              disabled={validPage === 1}
              className="size-8 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:bg-neutral-900/60 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === validPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`size-8 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-400 text-white shadow-sm'
                      : 'border border-neutral-800 bg-neutral-900/60 text-zinc-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, validPage + 1))}
              disabled={validPage === totalPages}
              className="size-8 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:bg-neutral-900/60 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
