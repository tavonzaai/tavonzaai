'use client';

import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Check, AlertCircle } from 'lucide-react';
import { PaymentRecord } from '../types';
import { INITIAL_PAYMENTS } from '../data';

interface PaymentDetailViewProps {
  paymentId?: string;
  onBack: () => void;
  onApprovePayment?: (id: string) => void;
}

export default function PaymentDetailView({
  paymentId = 'pay-1',
  onBack,
  onApprovePayment,
}: PaymentDetailViewProps) {
  const [settled, setSettled] = useState(false);

  const payment: PaymentRecord =
    INITIAL_PAYMENTS.find((p) => p.id === paymentId) || INITIAL_PAYMENTS[0]!;

  const handleApprove = () => {
    setSettled(true);
    if (onApprovePayment) {
      onApprovePayment(payment.recordId || payment.orderNumber);
    }
  };

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

      {/* Header Info matching Figma */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3.5">
            <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
              Order #1058
            </h1>
            <div className={`px-3 py-1.5 rounded-md outline outline-1 outline-offset-[-1px] flex items-center gap-1.5 ${
              settled
                ? 'bg-green-500/10 outline-green-500/30 text-green-400'
                : 'bg-stone-900 outline-yellow-950 text-orange-400'
            }`}>
              <span className="text-xs font-medium font-['Inter']">
                {settled ? 'Settled & Completed' : 'Payment Pending'}
              </span>
            </div>
          </div>
          <span className="text-neutral-500 text-sm font-normal font-['Poppins']">
            Branch #01- Downtown Flagship. Record ID : Pay-1058
          </span>
        </div>

        {/* Total Payment Amount */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-white text-base font-semibold font-['Inter'] leading-5">
            Total Payment Amount
          </span>
          <span className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            $84.00
          </span>
        </div>
      </div>

      {/* 4 Cards matching Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Table Location */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-center gap-2">
          <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
            Table Location
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-base font-bold font-['Inter'] leading-5">
              Table -12
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              Main Dining
            </span>
          </div>
        </div>

        {/* Card 2: Serving Cashier */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-center gap-2">
          <span className="text-neutral-400 text-sm font-semibold font-['Inter']">
            Serving Cashier
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-base font-bold font-['Inter'] leading-5">
              James
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              Shift Register POS
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
              19 : 42 PM
            </span>
            <span className="text-neutral-400 text-sm font-normal font-['Inter'] leading-4">
              Today
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
              Payment Method
            </span>
            <span className="text-white text-base font-bold font-['Inter'] leading-5 capitalize">
              cash
            </span>
            <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4 truncate">
              Visa Signature....4288
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Order Context Card matching Figma */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-white text-base font-semibold font-['Inter']">
            Customer & Order Context
          </span>
          <div className="flex flex-wrap items-center gap-4 text-sm font-['Inter']">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Guest Name :</span>
              <span className="text-white font-medium">Marcus Henderson</span>
            </div>
            <span className="text-neutral-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Party size :</span>
              <span className="text-white font-medium">2 guests</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={settled}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold font-['Inter'] transition flex items-center gap-2 ${
              settled
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md cursor-pointer active:scale-95'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{settled ? 'Authorization Approved' : 'Approve Settlement'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
