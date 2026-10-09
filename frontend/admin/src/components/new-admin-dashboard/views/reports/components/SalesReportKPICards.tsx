import React from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Percent } from 'lucide-react';

interface SalesReportKPICardsProps {
  dateRange: string;
}

export const SalesReportKPICards: React.FC<SalesReportKPICardsProps> = ({ dateRange }) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold font-sans leading-6">
          Sales Report
        </h2>
        <span className="text-xs text-neutral-400 font-sans">
          Aggregated for {dateRange}
        </span>
      </div>

      {/* 4 Metric KPI Cards (Gross Sales, Net Revenue, Orders, Refund Rate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Gross Sales */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-zinc-400 text-base font-semibold font-sans">
              Gross Sales
            </div>
            <span className="p-1 rounded-md bg-neutral-800 text-neutral-400">
              <DollarSign className="size-4" />
            </span>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-xl font-medium font-sans leading-6">
                $ 8.42M
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                ↑ 12.4% vs previous period
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Net Revenue */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-zinc-400 text-base font-semibold font-sans">
              Net Revenue
            </div>
            <span className="p-1 rounded-md bg-neutral-800 text-emerald-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-xl font-medium font-sans leading-6">
                $ 2.62M
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                91.2% of gross sales
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Orders */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-zinc-400 text-base font-semibold font-sans">
              Orders
            </div>
            <span className="p-1 rounded-md bg-neutral-800 text-amber-400">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-xl font-medium font-sans leading-6">
                $ 5K
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                Average ৳ 1,721
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Refund Rate */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 hover:border-neutral-700 transition-all">
          <div className="w-full flex justify-between items-center">
            <div className="text-zinc-400 text-base font-semibold font-sans">
              Refund Rate
            </div>
            <span className="p-1 rounded-md bg-neutral-800 text-neutral-400">
              <Percent className="size-4" />
            </span>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-white text-xl font-medium font-sans leading-6">
                0.8%
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-green-500 text-sm font-normal font-sans leading-4">
                ↓ 0.3% improvement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
