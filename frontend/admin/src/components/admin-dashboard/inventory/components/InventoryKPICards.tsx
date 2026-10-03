'use client';

import React from 'react';
import { InventoryItem } from '../types';

export interface InventoryKPICardsProps {
  items: InventoryItem[];
}

export default function InventoryKPICards({ items }: InventoryKPICardsProps) {
  const totalCount = items.length;
  const criticalOrLowCount = items.filter(
    (i) => i.status === 'Critical' || i.status === 'Low Stock'
  ).length;
  const outOfStockCount = items.filter((i) => i.status === 'Out of Stock').length;
  const inStockCount = items.filter((i) => i.status === 'In Stock').length;

  const format2Digits = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {/* 1. Total Items */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-white text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(totalCount)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Total Items
        </div>
      </div>

      {/* 2. Critical / Low */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-orange-500 text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(criticalOrLowCount)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Critical / Low
        </div>
      </div>

      {/* 3. Out of Stock */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-red-500 text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(outOfStockCount)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          Out of Stock
        </div>
      </div>

      {/* 4. In Stock */}
      <div className="h-20 px-5 py-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] border border-white/5 flex flex-col justify-center">
        <div className="text-green-500 text-2xl font-bold font-['Inter'] leading-5">
          {format2Digits(inStockCount)}
        </div>
        <div className="text-white/80 text-sm font-semibold font-['Inter'] leading-5 mt-1">
          In Stock
        </div>
      </div>
    </div>
  );
}
