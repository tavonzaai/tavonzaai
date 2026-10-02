'use client';

import React from 'react';
import { Supplier } from '../types';

export interface SuppliersKPICardsProps {
  suppliers: Supplier[];
}

export default function SuppliersKPICards({ suppliers }: SuppliersKPICardsProps) {
  const activeCount = suppliers.filter((s) => s.status === 'Active').length;
  const totalProducts = suppliers.reduce((acc, s) => acc + s.productsCount, 0);
  const avgReliability =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce((acc, s) => acc + s.reliabilityPercent, 0) /
            suppliers.length
        )
      : 0;
  const deliveriesThisWeek = suppliers.filter(
    (s) =>
      s.nextDelivery !== '__' &&
      s.nextDelivery !== '' &&
      s.status === 'Active'
  ).length;

  const format2Digits = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Active Suppliers */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(activeCount)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Active Suppliers
        </div>
      </div>

      {/* 2. Total Products */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {totalProducts}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Total Products
        </div>
      </div>

      {/* 3. Avg Reliability */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {avgReliability}%
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Avg Reliability
        </div>
      </div>

      {/* 4. Deliveries This Week */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(deliveriesThisWeek)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Deliveries This Week
        </div>
      </div>
    </div>
  );
}
