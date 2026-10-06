'use client';

import React, { useState, useEffect } from 'react';
import { TableItem, OrderDish } from '../types';
import {
  ArrowLeft,
  Clock,
  UserCheck,
  Sparkles,
  Flame,
  Wine,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import { branchManagerService, getActiveBranchId, LiveOrderItem } from '../../../redux/features/branchManagerApi';

interface TableDetailViewProps {
  table: TableItem;
  onBack: () => void;
  onOpenReassign: () => void;
  onOpenAskAi: () => void;
}

export default function TableDetailView({
  table,
  onBack,
  onOpenReassign,
  onOpenAskAi,
}: TableDetailViewProps) {
  const [tableOrders, setTableOrders] = useState<LiveOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTableOrders() {
      try {
        setLoading(true);
        const branchId = getActiveBranchId();
        const orders = await branchManagerService.getOrders(branchId, { tableId: table.id });
        if (isMounted) {
          setTableOrders(Array.isArray(orders) ? orders : []);
        }
      } catch (err) {
        console.warn('Failed to load table orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTableOrders();
    return () => {
      isMounted = false;
    };
  }, [table.id]);

  // Extract real dishes from live orders
  const activeOrder = tableOrders.find(
    (o) => o.status !== 'CANCELLED' && o.status !== 'COMPLETED'
  ) || tableOrders[0];

  const dishes: OrderDish[] = activeOrder?.items && activeOrder.items.length > 0
    ? activeOrder.items.map((item, idx) => ({
        id: item.id || `dish-${idx}`,
        name: item.name || 'Menu Item',
        station: 'Main Kitchen',
        status: activeOrder.status === 'READY_TO_SERVE' || activeOrder.status === 'READY' ? 'Ready' : 'preparing',
        notes: item.notes || '',
        quantity: item.quantity || 1,
      }))
    : [];

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins']">Back to floor</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenReassign}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg border border-neutral-800 flex items-center gap-2 transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Reassign Waiter</span>
          </button>

          <button
            type="button"
            onClick={onOpenAskAi}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Table Header Info Card */}
      <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-bold font-['Inter']">
              {table.number} Overview
            </h1>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
              table.status === 'occupied'
                ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {table.status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-400 font-['Inter']">
            <span>Capacity: {table.capacity || 4} guests</span>
            <span>•</span>
            <span>Assigned Waiter: <strong className="text-white font-medium">{table.waiter || 'Floor Team'}</strong></span>
            {activeOrder && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Placed: {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
          <span className="text-xs text-neutral-500 font-['Inter']">Order Reference</span>
          <span className="text-white text-lg font-semibold font-['Inter']">
            {activeOrder ? activeOrder.orderNumber : 'No Active Order'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Station Progress & Dish Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Station Kitchen Routing */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-lg font-semibold font-['Poppins']">
              Ordered Items & Live Status
            </h2>
            <span className="text-xs text-neutral-400">
              {dishes.length} Item(s)
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-neutral-500 text-sm font-['Inter']">
              Loading table orders from database...
            </div>
          ) : dishes.length === 0 ? (
            <div className="py-12 text-center space-y-2 font-['Inter']">
              <UtensilsCrossed className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-300 font-medium">No Active Items for this Table</p>
              <p className="text-xs text-neutral-500">Table is ready for new guest orders.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {dishes.map((dish) => (
                <div key={dish.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-semibold font-['Inter']">
                        {dish.quantity}X
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium font-['Poppins']">
                        {dish.name}
                      </span>
                      <span className="text-neutral-500 text-xs font-['Inter']">
                        {dish.station}
                      </span>
                      {dish.notes && (
                        <span className="text-yellow-400 text-xs font-['Inter'] mt-0.5">
                          {dish.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {dish.status === 'Ready' ? (
                      <div className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                        <span>Preparing</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Station Live Monitor Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-3">
            <span className="text-white text-base font-semibold font-['Poppins']">
              Table Order Summary
            </span>

            <div className="space-y-3 pt-1 text-sm font-['Inter']">
              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">Order Subtotal</span>
                <span className="text-white font-medium">
                  ${(Number(activeOrder?.totalAmount ?? activeOrder?.total) || 0).toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">Payment Status</span>
                <span className={`font-semibold ${activeOrder?.paymentStatus === 'PAID' ? 'text-teal-400' : 'text-amber-400'}`}>
                  {activeOrder?.paymentStatus || 'Awaiting Bill'}
                </span>
              </div>

              <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">Table Session</span>
                <span className="text-neutral-300 font-mono text-xs">
                  {table.activeSessionId ? `${table.activeSessionId.slice(0, 8)}...` : 'Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
