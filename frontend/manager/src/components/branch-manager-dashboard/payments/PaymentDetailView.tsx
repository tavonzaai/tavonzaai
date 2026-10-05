'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Check, AlertCircle } from 'lucide-react';
import { branchManagerService, LiveOrderItem } from '../../../redux/features/branchManagerApi';

interface PaymentDetailViewProps {
  paymentId?: string;
  onBack: () => void;
  onApprovePayment?: (id: string) => void;
}

export default function PaymentDetailView({
  paymentId,
  onBack,
  onApprovePayment,
}: PaymentDetailViewProps) {
  const [order, setOrder] = useState<LiveOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    const loadDetail = async () => {
      try {
        const liveOrder = await branchManagerService.getOrderDetail(paymentId);
        if (liveOrder) {
          setOrder(liveOrder);
          if (liveOrder.paymentStatus === 'PAID') {
            setSettled(true);
          }
        }
      } catch (err) {
        console.error('Failed to load order/payment detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [paymentId]);

  const handleApprove = () => {
    setSettled(true);
    if (onApprovePayment && order) {
      onApprovePayment(order.id || order.orderId);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins']">Back to payments</span>
        </button>
        <div className="py-20 text-center text-zinc-500 font-['Inter']">
          Loading settlement details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins']">Back to payments</span>
        </button>
        <div className="p-8 text-center text-zinc-400 bg-neutral-900 border border-neutral-800 rounded-xl">
          Order settlement details not found.
        </div>
      </div>
    );
  }

  const isPaid = settled || order.paymentStatus === 'PAID';

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
        <span className="text-xs font-semibold font-['Poppins']">Back to payments</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3.5">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
              Order {order.orderNumber}
            </h1>
            <div className={`px-3 py-1.5 rounded-md outline outline-1 outline-offset-[-1px] flex items-center gap-1.5 ${
              isPaid
                ? 'bg-green-500/10 outline-green-500/30 text-green-400'
                : 'bg-stone-900 outline-yellow-950 text-orange-400'
            }`}>
              <span className="text-xs font-medium font-['Inter']">
                {isPaid ? 'Settled & Completed' : 'Payment Pending'}
              </span>
            </div>
          </div>
          <span className="text-neutral-500 text-sm font-normal font-['Poppins']">
            Branch Record ID : {(order.id || order.orderId)?.slice(0, 8)}
          </span>
        </div>

        {/* Total Payment Amount */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-white text-base font-semibold font-['Inter'] leading-5">
            Total Payment Amount
          </span>
          <span className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            ${(order.totalAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Table Location */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-center gap-2">
          <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
            Table Location
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-base font-bold font-['Inter'] leading-5">
              {order.tableNumber || 'Takeaway'}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              Main Dining Area
            </span>
          </div>
        </div>

        {/* Card 2: Serving Waiter */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-center gap-2">
          <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
            Serving Waiter
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-base font-bold font-['Inter'] leading-5">
              {order.waiterName || 'Staff Assigned'}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              Floor Service
            </span>
          </div>
        </div>

        {/* Card 3: Timestamp */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-center gap-2">
          <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
            Timestamp
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-base font-bold font-['Inter'] leading-5">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Card 4: Payment Method */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
              Payment Status
            </span>
            <span className="text-white text-base font-bold font-['Inter'] leading-5 capitalize">
              {order.paymentStatus || 'UNPAID'}
            </span>
            <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4 truncate">
              Order #{order.orderNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Order Context Card */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-white text-base font-semibold font-['Inter']">
            Line Items ({order.items?.length || 0})
          </span>
          <div className="flex flex-wrap items-center gap-4 text-sm font-['Inter']">
            {(order.items || []).map((item, idx) => (
              <span key={idx} className="text-neutral-300">
                {item.quantity}x {item.name} (${((item.lineTotal ?? (item.unitPrice * item.quantity)) || 0).toFixed(2)})
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPaid}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold font-['Inter'] transition flex items-center gap-2 ${
              isPaid
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md cursor-pointer active:scale-95'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isPaid ? 'Settlement Verified' : 'Approve Settlement'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
