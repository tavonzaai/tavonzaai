'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderRow } from '../types';

export interface OrdersTableProps {
  orders: OrderRow[];
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  onViewAll: () => void;
}

export default function OrdersTable({
  orders,
  currentPage,
  setCurrentPage,
  onViewAll,
}: OrdersTableProps) {
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, orders.length);
  const displayedOrders = orders.slice(startIndex, endIndex);

  const getStatusBadge = (status: OrderRow['status']) => {
    switch (status) {
      case 'Preparing':
        return (
          <span className="px-3 py-1 bg-[#361908] rounded-[5px] text-[#FF7A00] text-sm font-semibold inline-flex items-center justify-center">
            Preparing
          </span>
        );
      case 'Ready':
        return (
          <span className="px-3 py-1 bg-[#092B19] rounded-[5px] text-[#10B981] text-sm font-semibold inline-flex items-center justify-center">
            Ready
          </span>
        );
      case 'Served':
        return (
          <span className="px-3 py-1 bg-[#1E112A] rounded-[5px] text-[#C084FC] text-sm font-semibold inline-flex items-center justify-center">
            Served
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 bg-[#092B19] rounded-[5px] text-[#10B981] text-sm font-semibold inline-flex items-center justify-center">
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="px-3 py-1 bg-[#332200] rounded-[5px] text-[#FBBF24] text-sm font-semibold inline-flex items-center justify-center">
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 bg-[#2D0D0D] rounded-[5px] text-[#F87171] text-sm font-semibold inline-flex items-center justify-center">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[850px]">
          {/* Header */}
          <thead>
            <tr className="bg-zinc-900 text-white text-base font-semibold font-['Inter'] leading-5 border-b border-zinc-800">
              <th className="py-4 px-5">Order ID</th>
              <th className="py-4 px-5">Table</th>
              <th className="py-4 px-5">Customer</th>
              <th className="py-4 px-5">Items</th>
              <th className="py-4 px-5">Server</th>
              <th className="py-4 px-5">Time</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Total</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-zinc-800/80 text-base font-medium font-['Inter']">
            {displayedOrders.length > 0 ? (
              displayedOrders.map((order, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.03] transition-colors text-white"
                >
                  <td className="py-3.5 px-5 text-white font-medium">{order.id}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 bg-white/20 rounded-[5px] text-white text-sm font-semibold inline-block">
                      {order.table}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-white">{order.customer}</td>
                  <td className="py-3.5 px-5 text-white">{order.items}</td>
                  <td className="py-3.5 px-5 text-white">{order.server}</td>
                  <td className="py-3.5 px-5 text-white">{order.time}</td>
                  <td className="py-3.5 px-5">{getStatusBadge(order.status)}</td>
                  <td className="py-3.5 px-5 text-right text-white font-semibold">
                    {order.total}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-500 text-base">
                  No orders match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination Bar */}
      <div className="p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-zinc-500 text-base font-medium font-['Inter']">
          Showing {orders.length > 0 ? `${startIndex + 1}-${endIndex}` : '0'} of {orders.length} results
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-sm border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-sm text-base font-medium flex items-center justify-center transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-amber-400 text-white font-bold shadow-[0px_0px_3px_0px_rgba(255,185,0,1.00)]'
                  : 'border border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-sm border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onViewAll}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-[5px] text-white text-sm font-semibold font-['Inter'] shadow-[0px_1px_2px_-1px_rgba(255,214,168,1.00)] transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>
    </div>
  );
}
