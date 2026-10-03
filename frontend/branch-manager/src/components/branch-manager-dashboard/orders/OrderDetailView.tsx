'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Clock, User, AlertTriangle, X } from 'lucide-react';

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
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState(false);

  const timelineSteps = [
    { label: 'Received', time: '22m ago', completed: true },
    { label: 'Sent to Kitchen', time: '20m ago', completed: true },
    { label: 'In Preparation', time: '18m ago', completed: true },
    { label: 'Ready to Serve', time: 'In Queue', completed: false },
    { label: 'Paid & Closed', time: 'In Queue', completed: false },
  ];

  const handleConfirmVoid = () => {
    setOrderCancelled(true);
    setIsVoidModalOpen(false);
    if (onVoidOrder) {
      onVoidOrder(orderId);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
        <span className="text-xs font-semibold font-['Poppins'] leading-4">Back to floor</span>
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
              Order #{orderId}
            </h1>
            <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
              orderCancelled
                ? 'bg-red-500/10 text-red-400'
                : 'bg-fuchsia-500/10 text-fuchsia-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${orderCancelled ? 'bg-red-400' : 'bg-fuchsia-400 animate-pulse'}`} />
              <span className="text-xs font-medium font-['Inter'] capitalize">
                {orderCancelled ? 'Cancelled / Voided' : 'preparing'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-neutral-500 text-sm font-normal font-['Poppins']">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Created 22m ago
            </span>
            <span>·</span>
            <span>Source: Dine-in</span>
            <span>·</span>
            <span>Waitstaff: Sara</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium font-['Inter'] rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 transition"
          >
            View Full Order details
          </button>
        </div>
      </div>

      {/* 5-Step Progress Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {timelineSteps.map((step, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-lg outline outline-1 outline-offset-[-1px] flex flex-col justify-center gap-1 transition ${
              step.completed
                ? 'bg-teal-500/10 outline-teal-500/20 text-teal-400'
                : 'bg-neutral-900/60 outline-neutral-800 text-neutral-500'
            }`}
          >
            <span className={`text-base font-medium font-['Inter'] leading-5 ${step.completed ? 'text-teal-400' : 'text-neutral-400'}`}>
              {step.label}
            </span>
            <span className={`text-xs font-normal font-['Poppins'] ${step.completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {step.time}
            </span>
          </div>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ordered Items & Kitchen Routing */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 p-5 space-y-4">
          <div className="pb-3 border-b border-zinc-800/80">
            <h2 className="text-white text-lg font-semibold font-['Poppins']">
              Ordered Items & Kitchen Routing
            </h2>
          </div>

          {/* Dish 1 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg outline outline-1 outline-neutral-700 flex items-center justify-center shrink-0">
                <span className="text-gray-300 text-xs font-semibold font-['Inter']">1X</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white text-base font-normal font-['Poppins']">
                    Grilled Chicken
                  </span>
                  <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                    (Grill Station)
                  </span>
                </div>
                <span className="text-yellow-400 text-xs font-normal font-['Poppins'] mt-0.5">
                  Extra garlic butter
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-white text-base font-semibold font-['Inter']">$22.00</span>
              <div className="px-2.5 py-1 bg-teal-500/10 rounded-lg inline-flex items-center gap-1 text-teal-500 text-xs font-medium font-['Inter']">
                <Check className="w-3.5 h-3.5" />
                <span>Ready</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800/60" />

          {/* Dish 2 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg outline outline-1 outline-neutral-700 flex items-center justify-center shrink-0">
                <span className="text-gray-300 text-xs font-semibold font-['Inter']">1X</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white text-base font-normal font-['Poppins']">
                    Caesar Salad Supreme
                  </span>
                  <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                    (Cold Station)
                  </span>
                </div>
                <span className="text-yellow-400 text-xs font-normal font-['Poppins'] mt-0.5">
                  Dressing on side
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-white text-base font-semibold font-['Inter']">$14.00</span>
              <div className="px-2.5 py-1 bg-fuchsia-500/10 rounded-lg inline-flex items-center gap-1.5 text-fuchsia-400 text-xs font-medium font-['Inter']">
                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                <span>preparing</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800/60" />

          {/* Dish 3 */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg outline outline-1 outline-neutral-700 flex items-center justify-center shrink-0">
                <span className="text-gray-300 text-xs font-semibold font-['Inter']">2X</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white text-base font-normal font-['Poppins']">
                    Mojito Cocktail
                  </span>
                  <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                    (Bar Station)
                  </span>
                </div>
                <span className="text-yellow-400 text-xs font-normal font-['Poppins'] mt-0.5">
                  Less Ice
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-white text-base font-semibold font-['Inter']">$36.00</span>
              <div className="px-2.5 py-1 bg-teal-500/10 rounded-lg inline-flex items-center gap-1 text-teal-500 text-xs font-medium font-['Inter']">
                <Check className="w-3.5 h-3.5" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Order Information */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold font-['Poppins']">Payment</span>
              <span className="px-2.5 py-1 bg-red-400/10 text-red-400 rounded-lg text-xs font-medium font-['Inter']">
                Unpaid
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-sm font-['Poppins']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Subtotal</span>
                <span className="text-white font-medium font-['Inter']">$ 54.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Tax</span>
                <span className="text-white font-medium font-['Inter']">$ 5.40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Payment Method</span>
                <span className="text-white font-medium font-['Inter']">Pending</span>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800/80 my-1" />

            <div className="flex justify-between items-center">
              <span className="text-white text-base font-semibold font-['Poppins']">Total</span>
              <span className="text-amber-500 text-lg font-semibold font-['Poppins']">$64.24</span>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
            <span className="text-white text-lg font-semibold font-['Poppins']">
              Order Information
            </span>

            <div className="flex flex-col gap-2.5 text-sm font-['Poppins']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Waiter Name</span>
                <div className="flex items-center gap-1.5 text-white font-medium font-['Inter']">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sara</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Customer Name</span>
                <span className="text-white font-normal">Milhon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Customer phone</span>
                <span className="text-white font-normal">+99125412352</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(true)}
                disabled={orderCancelled}
                className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium font-['Inter'] transition flex items-center justify-center gap-2 ${
                  orderCancelled
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-red-400/20 hover:bg-red-500/30 text-red-300 outline outline-1 outline-red-400/30 cursor-pointer active:scale-98'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{orderCancelled ? 'Order Voided' : 'Void / Cancel Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-white text-lg font-semibold font-['Poppins']">
                  Void Order #{orderId}?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neutral-400 text-sm font-['Inter']">
              Are you sure you want to cancel and void Order #{orderId}? This will notify the kitchen stations (Grill, Cold, Bar) to stop prep and cancel open payment charges.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="px-4 py-2 text-sm text-neutral-300 hover:text-white bg-neutral-800 rounded-lg font-['Inter']"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg font-semibold font-['Inter'] transition shadow-md"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
