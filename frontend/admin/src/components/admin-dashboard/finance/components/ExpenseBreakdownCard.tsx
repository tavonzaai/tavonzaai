'use client';

import React from 'react';
import { ExpenseItem } from '../types';

export interface ExpenseBreakdownCardProps {
  expenses: ExpenseItem[];
}

export default function ExpenseBreakdownCard({
  expenses,
}: ExpenseBreakdownCardProps) {
  const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  // SVG Donut calculation
  let cumulativePercent = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full bg-white/5 rounded-2xl border border-white/20 backdrop-blur-[10.20px] p-6 flex flex-col justify-between shadow-2xl">
      <div>
        {/* Title */}
        <h3 className="text-neutral-50 text-lg font-bold font-['Plus_Jakarta_Sans'] leading-6">
          Expense Breakdown
        </h3>

        {/* Center Donut SVG */}
        <div className="flex items-center justify-center py-4">
          <div className="relative size-28 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              {expenses.map((item) => {
                const strokeDasharray = `${
                  (item.percentage / 100) * circumference
                } ${circumference}`;
                const strokeDashoffset = `${
                  -(cumulativePercent / 100) * circumference
                }`;
                cumulativePercent += item.percentage;

                return (
                  <circle
                    key={item.id}
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
        <div className="space-y-2.5 pt-1">
          {expenses.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm font-['Inter']"
            >
              {/* Name & Dot */}
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 text-sm font-normal">
                  {item.name}
                </span>
              </div>

              {/* Amount & Percent */}
              <div className="text-right">
                <div className="text-white text-sm font-semibold">
                  ${item.amount.toLocaleString()}
                </div>
                <div className="text-slate-500 text-xs">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Total */}
      <div className="pt-3.5 mt-3 border-t border-slate-800 flex items-center justify-between font-['Inter']">
        <span className="text-slate-400 text-sm font-normal">Total Expenses</span>
        <span className="text-white text-base font-bold">
          ${totalAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
