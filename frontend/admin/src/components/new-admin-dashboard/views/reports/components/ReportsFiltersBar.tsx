'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsFiltersBarProps {
  dateRange: string;
  onDateRangeChange: (d: string) => void;
  selectedRestaurant: string;
  onRestaurantChange: (r: string) => void;
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (m: string) => void;
}

export function ReportsFiltersBar({
  dateRange,
  onDateRangeChange,
  selectedRestaurant,
  onRestaurantChange,
  selectedBranch,
  onBranchChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
}: ReportsFiltersBarProps) {
  return (
    <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-xs font-normal font-sans leading-4">
            Date Range
          </label>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => {
                onDateRangeChange(e.target.value);
                toast.info(`Timeframe set to: ${e.target.value}`);
              }}
              className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="Last 30 days">Last 30 days</option>
              <option value="Today">Today</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="This Month">This Month</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="Year to Date">Year to Date (YTD)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
          </div>
        </div>

        {/* Restaurant Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-xs font-normal font-sans leading-4">
            Restaurant
          </label>
          <div className="relative">
            <select
              value={selectedRestaurant}
              onChange={(e) => {
                onRestaurantChange(e.target.value);
                toast.info(`Filtered by restaurant: ${e.target.value}`);
              }}
              className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="All Restaurants">All Restaurants</option>
              <option value="Tavonza Kitchen">Tavonza Kitchen</option>
              <option value="Ember & Grain">Ember & Grain</option>
              <option value="Kori Social">Kori Social</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
          </div>
        </div>

        {/* Branch Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-xs font-normal font-sans leading-4">
            Branch
          </label>
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => {
                onBranchChange(e.target.value);
                toast.info(`Filtered by branch: ${e.target.value}`);
              }}
              className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="All Branches">All Branches</option>
              <option value="Georgia Flagship">Georgia Flagship</option>
              <option value="Florida Flagship">Florida Flagship</option>
              <option value="Illinois Flagship">Illinois Flagship</option>
              <option value="Texas Flagship">Texas Flagship</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
          </div>
        </div>

        {/* Payment Method Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-xs font-normal font-sans leading-4">
            Payment Method
          </label>
          <div className="relative">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => {
                onPaymentMethodChange(e.target.value);
                toast.info(`Filtered by payment method: ${e.target.value}`);
              }}
              className="w-full h-11 px-3.5 bg-neutral-900 text-neutral-200 text-sm font-normal font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 appearance-none focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="All Methods">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Stripe">Stripe</option>
              <option value="POS Terminal">POS Terminal</option>
              <option value="QR Pay">QR Pay</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
