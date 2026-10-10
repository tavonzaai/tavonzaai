'use client';

import React from 'react';
import { DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function PaymentsKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Total Revenue */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
        <div className="w-full flex justify-between items-center">
          <div className="text-white text-lg font-semibold font-sans">Total Revenue</div>
          <span className="p-1.5 rounded-lg bg-neutral-800/80 text-amber-400">
            <DollarSign className="size-4" />
          </span>
        </div>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-2xl font-medium font-sans leading-7">
              $ 2.84M
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-green-500 text-sm font-normal font-sans leading-4">
              ↑ 11.2% this month
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Completed */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
        <div className="w-full flex justify-between items-center">
          <div className="text-white text-lg font-semibold font-sans">Completed</div>
          <span className="p-1.5 rounded-lg bg-neutral-800/80 text-emerald-400">
            <CheckCircle2 className="size-4" />
          </span>
        </div>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-2xl font-medium font-sans leading-7">
              $ 2.62M
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-green-500 text-sm font-normal font-sans leading-4">
              1,842 transactions
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Pending */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
        <div className="w-full flex justify-between items-center">
          <div className="text-white text-lg font-semibold font-sans">Pending</div>
          <span className="p-1.5 rounded-lg bg-neutral-800/80 text-amber-400">
            <Clock className="size-4" />
          </span>
        </div>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-2xl font-medium font-sans leading-7">
              $ 5K
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-green-500 text-sm font-normal font-sans leading-4">
              24 transactions
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Refunded */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-4 hover:border-neutral-700 transition-all">
        <div className="w-full flex justify-between items-center">
          <div className="text-white text-lg font-semibold font-sans">Refunded</div>
          <span className="p-1.5 rounded-lg bg-neutral-800/80 text-rose-400">
            <AlertCircle className="size-4" />
          </span>
        </div>
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="w-full flex justify-between items-center">
            <div className="text-white text-2xl font-medium font-sans leading-7">
              $ 2K
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="text-green-500 text-sm font-normal font-sans leading-4">
              18 transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
