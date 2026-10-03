'use client';

import React, { useState } from 'react';
import { mockKitchenOrders } from '../data';
import { KitchenOrderItem } from '../types';
import { Check, CheckCircle2, Pencil, Trash2, Clock, Filter, Sparkles, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  searchQuery?: string;
}

export default function KitchenLiveOrdersSection({ searchQuery = '' }: Props) {
  const [orders, setOrders] = useState<KitchenOrderItem[]>(mockKitchenOrders);
  const [filterStation, setFilterStation] = useState<string>('All');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.station.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStation =
      filterStation === 'All' || order.station.toLowerCase() === filterStation.toLowerCase();

    return matchesSearch && matchesStation;
  });

  const handleBumpOrder = (id: string, orderNumber: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.success(`Order ${orderNumber} completed and bumped!`);
  };

  const handleDeleteOrder = (id: string, orderNumber: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.error(`Order ${orderNumber} cancelled & removed.`);
  };

  const handleEditOrder = (orderNumber: string) => {
    toast.info(`Editing ticket ${orderNumber} in Kitchen Queue`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Normal':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="bg-black/40 rounded-2xl border border-white/10 p-5 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Inter']">Kitchen Live Orders</h3>
            <div className="text-sm text-zinc-400">Real-time table tickets & active cooking stations</div>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Grill', 'Fry', 'Pizza', 'Dessert'].map((station) => (
            <button
              key={station}
              type="button"
              onClick={() => setFilterStation(station)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                filterStation === station
                  ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {station}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[650px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-sm font-semibold text-zinc-400">
                <th className="py-3 px-3.5 font-['Inter']">Order #</th>
                <th className="py-3 px-3.5 font-['Inter']">Table</th>
                <th className="py-3 px-3.5 font-['Inter']">Items</th>
                <th className="py-3 px-3.5 font-['Inter'] text-center">Priority</th>
                <th className="py-3 px-3.5 font-['Inter'] text-right">ETA</th>
                <th className="py-3 px-3.5 font-['Inter'] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                    No active orders matching search/filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-3.5 font-bold text-white font-mono">{order.orderNumber}</td>
                    <td className="py-3.5 px-3.5 font-medium text-zinc-300">{order.table}</td>
                    <td className="py-3.5 px-3.5 text-zinc-200 font-normal">
                      <div className="flex items-center gap-1.5">
                        <span>{order.items}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 font-mono">
                          {order.station}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-medium text-amber-400">
                      {order.eta}
                    </td>
                    <td className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* 1. Mark Complete / Ready Button */}
                        <button
                          type="button"
                          onClick={() => handleBumpOrder(order.id, order.orderNumber)}
                          className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer p-1 rounded hover:bg-emerald-500/10"
                          title="Mark Ready / Complete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        {/* 2. Edit Order Button */}
                        <button
                          type="button"
                          onClick={() => handleEditOrder(order.orderNumber)}
                          className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer p-1 rounded hover:bg-amber-500/10"
                          title="Edit Ticket"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* 3. Delete / Trash Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          className="text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded hover:bg-rose-500/10"
                          title="Delete / Cancel Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm text-zinc-500">
        <span>Displaying {filteredOrders.length} active tickets</span>
        <span className="font-mono text-emerald-400">Target ETA SLA: &lt; 15 mins</span>
      </div>
    </div>
  );
}
