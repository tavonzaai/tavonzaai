'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock, User, AlertTriangle, X, UtensilsCrossed, Loader2 } from 'lucide-react';
import { branchManagerService, LiveOrderItem } from '../../../redux/features/branchManagerApi';

interface OrderDetailViewProps {
  orderId?: string;
  onBack: () => void;
  onVoidOrder?: (orderId: string) => void;
}

export default function OrderDetailView({
  orderId = '1042',
  onBack,
  onVoidOrder,
}: OrderDetailViewProps) {
  const [order, setOrder] = useState<LiveOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOrderDetail() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const liveOrder = await branchManagerService.getOrderDetail(orderId);
        if (isMounted && liveOrder) {
          setOrder(liveOrder);
          if (liveOrder.status === 'CANCELLED' || liveOrder.status === 'VOIDED') {
            setOrderCancelled(true);
          }
        }
      } catch (err) {
        console.warn('Could not load live order detail via findOne:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrderDetail();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleConfirmVoid = async () => {
    try {
      if (orderId) {
        await branchManagerService.updateOrderStatus(orderId, 'CANCELLED');
      }
    } catch {}
    setOrderCancelled(true);
    setIsVoidModalOpen(false);
    if (onVoidOrder) {
      onVoidOrder(orderId);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = String(status || '').toUpperCase();
    if (orderCancelled || s === 'CANCELLED') {
      return (
        <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-red-500/10 text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-xs font-medium font-['Inter']">Cancelled / Voided</span>
        </div>
      );
    }
    if (s === 'COMPLETED' || s === 'SERVED') {
      return (
        <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-teal-500/10 text-teal-400">
          <Check className="w-3.5 h-3.5" />
          <span className="text-xs font-medium font-['Inter']">Served / Completed</span>
        </div>
      );
    }
    if (s === 'READY' || s === 'READY_TO_SERVE') {
      return (
        <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-teal-500/10 text-teal-400">
          <Check className="w-3.5 h-3.5" />
          <span className="text-xs font-medium font-['Inter']">Ready to Serve</span>
        </div>
      );
    }
    return (
      <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-fuchsia-500/10 text-fuchsia-400">
        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
        <span className="text-xs font-medium font-['Inter'] capitalize">{s || 'Preparing'}</span>
      </div>
    );
  };

  const rawOrder = (order || {}) as any;
  const orderItems = order?.items || [];
  const subtotal = Number(rawOrder.subtotal ?? (Number(rawOrder.totalAmount ?? rawOrder.total ?? 0) * 0.9));
  const tax = Number(rawOrder.taxAmount ?? (subtotal * 0.1));
  const total = Number(rawOrder.totalAmount ?? rawOrder.total ?? (subtotal + tax));

  const statusUpper = String(order?.status || '').toUpperCase();
  const timelineSteps = [
    { label: 'Received', completed: true },
    { label: 'Sent to Kitchen', completed: statusUpper !== 'PENDING' },
    { label: 'In Preparation', completed: statusUpper === 'PREPARING' || statusUpper === 'READY' || statusUpper === 'SERVED' || statusUpper === 'COMPLETED' },
    { label: 'Ready to Serve', completed: statusUpper === 'READY' || statusUpper === 'SERVED' || statusUpper === 'COMPLETED' },
    { label: 'Paid & Closed', completed: order?.paymentStatus === 'PAID' || statusUpper === 'COMPLETED' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
        <span className="text-xs font-semibold font-['Poppins'] leading-4">Back to orders</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
              Order {order?.orderNumber || `#${orderId.slice(0, 8)}`}
            </h1>
            {getStatusBadge(order?.status)}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-neutral-400 text-sm font-normal font-['Poppins']">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
            <span>·</span>
            <span>Table: <strong className="text-white">{order?.tableNumber || rawOrder.tableLabel || 'Assigned'}</strong></span>
            <span>·</span>
            <span>Waitstaff: <strong className="text-white">{rawOrder.waiter || rawOrder.waiterName || 'Floor Staff'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!orderCancelled && statusUpper !== 'COMPLETED' && (
            <button
              type="button"
              onClick={() => setIsVoidModalOpen(true)}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium font-['Inter'] rounded-lg border border-red-500/30 transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Void Order</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Progress Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {timelineSteps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-lg border flex flex-col justify-center gap-1 transition ${
              step.completed
                ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-sm font-medium font-['Inter'] ${step.completed ? 'text-teal-400' : 'text-neutral-400'}`}>
              {step.label}
            </span>
            <span className="text-xs font-['Poppins'] text-neutral-500">
              {step.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ordered Items & Kitchen Routing */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-xl border border-neutral-800 p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-white text-lg font-semibold font-['Poppins']">
              Ordered Items & Kitchen Routing
            </h2>
            <span className="text-xs text-neutral-400">
              {orderItems.length} Item(s)
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-500 text-sm font-['Inter']">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              <span>Loading order items...</span>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="py-12 text-center space-y-2 font-['Inter']">
              <UtensilsCrossed className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-300 font-medium">Standard Dine-In Order Placed</p>
              <p className="text-xs text-neutral-500">Items routed directly to kitchen display system.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {orderItems.map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-semibold font-['Inter']">
                        {item.quantity || 1}X
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium font-['Poppins']">
                        {item.name || 'Dish'}
                      </span>
                      {item.notes && (
                        <span className="text-yellow-400 text-xs font-['Inter'] mt-0.5">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-white text-sm font-semibold font-['Inter']">
                      ${(Number((item as any).price || item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                      Kitchen
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Payment & Order Information */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-base font-semibold font-['Poppins']">Payment</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium font-['Inter'] ${
                order?.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {order?.paymentStatus || 'Awaiting Payment'}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-sm font-['Poppins']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Subtotal</span>
                <span className="text-white font-medium font-['Inter']">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Tax</span>
                <span className="text-white font-medium font-['Inter']">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800 my-1" />

            <div className="flex justify-between items-center">
              <span className="text-white text-base font-semibold font-['Poppins']">Total</span>
              <span className="text-amber-400 text-xl font-bold font-['Poppins']">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-4">
            <span className="text-white text-base font-semibold font-['Poppins']">
              Order Information
            </span>

            <div className="flex flex-col gap-2.5 text-sm font-['Inter']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Waiter / Server</span>
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{rawOrder.waiter || rawOrder.waiterName || 'Floor Staff'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Customer</span>
                <span className="text-white">{rawOrder.customerName || 'Dine-in Guest'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-medium">Table Assignment</span>
                <span className="text-amber-400 font-medium">{order?.tableNumber || rawOrder.tableLabel || 'Floor Table'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void Order Confirmation Modal */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white font-['Poppins']">Void Order Confirmation</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Are you sure you want to cancel and void Order #{orderId}? This action will remove active kitchen tickets.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs"
              >
                Yes, Void Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
