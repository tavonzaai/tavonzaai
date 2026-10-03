'use client';

import React from 'react';
import { TopPerformingItem } from '../types';

interface TopPerformingItemsCardProps {
  items: TopPerformingItem[];
}

export const TopPerformingItemsCard: React.FC<TopPerformingItemsCardProps> = ({
  items,
}) => {
  return (
    <div className="p-6 md:p-7 bg-neutral-900 rounded-[10px] border border-white/5 space-y-4 shadow-md">
      {/* Header */}
      <div>
        <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
          Top Performing Items
        </h3>
        <p className="text-slate-500 text-sm font-normal font-['Inter'] leading-5 mt-0.5">
          Best sellers this shift
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.rank}
            className="h-9 md:h-10 bg-zinc-800 rounded-sm flex items-center pr-3 transition-colors hover:bg-zinc-800/80"
          >
            {/* Rank Box */}
            <div className="w-7 h-full bg-yellow-500/10 rounded-l-sm flex items-center justify-center shrink-0 border-r border-yellow-500/10">
              <span className="text-white text-sm font-bold font-['Inter']">
                {item.rank}
              </span>
            </div>

            {/* Item Name */}
            <span className="text-white text-sm font-medium font-['Inter'] w-28 md:w-36 truncate ml-3 shrink-0">
              {item.name}
            </span>

            {/* Progress Bar */}
            <div className="flex-1 h-2.5 md:h-3 bg-zinc-600 rounded-full overflow-hidden mx-3">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>

            {/* Quantity Sold */}
            <span className="text-neutral-400 text-sm font-medium font-['Inter'] w-8 md:w-10 text-right shrink-0">
              {item.quantitySold}x
            </span>

            {/* Vertical Red Divider */}
            <div className="h-4 border-l border-red-500 ml-3 mr-2 shrink-0" />

            {/* Total Revenue */}
            <span className="text-yellow-500 text-sm font-bold font-['Inter'] w-16 md:w-20 text-right shrink-0 font-['JetBrains_Mono']">
              ${item.revenue.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
