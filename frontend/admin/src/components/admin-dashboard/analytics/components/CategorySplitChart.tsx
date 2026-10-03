'use client';

import React from 'react';
import { CategorySplitItem } from '../types';

export interface CategorySplitChartProps {
  categories: CategorySplitItem[];
}

export default function CategorySplitChart({
  categories,
}: CategorySplitChartProps) {
  let cumulativePercent = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl">
      <div>
        {/* Header */}
        <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
          Category Split
        </h3>
        <p className="text-slate-400 text-sm font-normal font-['Inter'] mt-1">
          Revenue by menu category this week.
        </p>

        {/* Center Donut SVG */}
        <div className="flex items-center justify-center py-3">
          <div className="relative size-28 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              {categories.map((item) => {
                const strokeDasharray = `${
                  (item.percentage / 100) * circumference
                } ${circumference}`;
                const strokeDashoffset = `${
                  -(cumulativePercent / 100) * circumference
                }`;
                cumulativePercent += item.percentage;

                return (
                  <circle
                    key={item.name}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute text-center">
              <span className="text-white text-sm font-bold font-['Inter']">
                100%
              </span>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-2 pt-1 font-['Inter']">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between text-sm"
            >
              {/* Color Dot & Name */}
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-zinc-300 text-sm font-normal">
                  {cat.name}
                </span>
              </div>

              {/* Amount */}
              <span className="text-white text-sm font-medium font-mono">
                {cat.amountFormatted}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
