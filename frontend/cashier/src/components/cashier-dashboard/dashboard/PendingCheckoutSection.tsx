'use client';

import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { cashierService, getActiveBranchId } from '@/redux/features/cashierApi';
import { PendingCheckoutOrder } from '../types';
import { toast } from 'sonner';

interface PendingCheckoutProps {
  onOpenPOS?: () => void;
}

export default function PendingCheckoutSection({ onOpenPOS }: PendingCheckoutProps) {
  const [pendingOrders, setPendingOrders] = useState<PendingCheckoutOrder[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadPending = async () => {
      try {
        const branchId = getActiveBranchId();
        const raw = await cashierService.getOrders(branchId);
        if (mounted && Array.isArray(raw)) {
          const pending = raw
            .filter((o: any) => o.paymentStatus !== 'PAID')
            .map((o: any) => ({
              id: o.orderId || o.id,
              table: o.tableLabel || (o.tableId ? 'Table' : 'Takeaway'),
              customerName: o.customerName || 'Walk-in Guest',
              orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
              amount: Number(o.totalAmount || o.total || 0),
              itemCount: Array.isArray(o.items) ? o.items.length : 1,
              timeWaiting: 'Active',
            }));
          setPendingOrders(pending);
        }
      } catch (err) {
        console.error('Failed to load pending checkout orders:', err);
      }
    };
    loadPending();
    const handleUpdate = () => loadPending();
    window.addEventListener('tavonza:order_created', handleUpdate);
    window.addEventListener('tavonza:order_status_changed', handleUpdate);
    window.addEventListener('tavonza:payment_status_changed', handleUpdate);
    window.addEventListener('tavonza:payment_requested', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('tavonza:order_created', handleUpdate);
      window.removeEventListener('tavonza:order_status_changed', handleUpdate);
      window.removeEventListener('tavonza:payment_status_changed', handleUpdate);
      window.removeEventListener('tavonza:payment_requested', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              Pending Checkout
            </h2>
            <p className="text-neutral-400 text-sm font-medium font-['Inter'] leading-4 mt-1">
              Orders Waiting for Payment
            </p>
          </div>

          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-sm font-semibold rounded-[5px] font-['Inter']">
            {pendingOrders.length} {pendingOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {/* Order Items List */}
        <div className="space-y-2.5">
          {pendingOrders.length === 0 ? (
            <div className="py-6 text-center text-neutral-400 text-sm">
              All orders are fully settled.
            </div>
          ) : (
            pendingOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => toast.info(`Checkout order ${order.orderNumber} for ${order.customerName}`)}
                className="h-12 px-3 bg-white/5 hover:bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Table Badge */}
                  <div className="w-8 h-6 bg-white/10 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center justify-center">
                    <span className="text-white text-xs font-normal font-['Inter']">
                      {order.table}
                    </span>
                  </div>

                  {/* Name & Order Number */}
                  <div>
                    <div className="text-slate-200 text-sm font-semibold font-['Inter'] leading-tight">
                      {order.customerName}
                    </div>
                    <div className="text-slate-500 text-sm font-normal font-['Inter'] leading-tight">
                      {order.orderNumber}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-teal-500 text-sm font-semibold font-['Inter']">
                  ${order.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Button: Open POS */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onOpenPOS || (() => toast.info('Opening POS Checkout Register'))}
          className="w-full h-9 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 rounded-lg text-white text-base font-medium font-['Inter'] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 cursor-pointer"
        >
          <Monitor className="w-4 h-4" />
          <span>Open POS</span>
        </button>
      </div>
    </div>
  );
}
