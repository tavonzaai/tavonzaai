'use client';

import React from 'react';
import { PnLRow } from '../types';

export interface PnLTableProps {
  rows: PnLRow[];
  currentMonthName?: string;
}

export default function PnLTable({
  rows,
  currentMonthName = 'July 2025',
}: PnLTableProps) {
  return (
    <div className="w-full bg-white/10 rounded-[10px] border border-white/10 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
      {/* Title */}
      <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6">
        Profit &amp; Loss — {currentMonthName}
      </h3>

      {/* Table Container */}
      <div className="w-full rounded-[10px] border border-white/10 overflow-hidden bg-neutral-950/40 backdrop-blur-[30px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-neutral-800/40 border-b border-white/10 text-white text-base font-medium font-['Inter']">
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-5">This Month</th>
                <th className="py-4 px-5">Last Month</th>
                <th className="py-4 px-5">Change</th>
                <th className="py-4 px-6 text-right">YTD</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-zinc-800/80 font-['Inter']">
              {rows.map((row) => {
                const isPositiveChange = row.changePercent > 0;
                const isNeutral = row.changePercent === 0;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-white/[0.02] text-base ${
                      row.isSummary
                        ? 'bg-white/[0.04] font-semibold text-white'
                        : 'text-zinc-200 font-normal'
                    }`}
                  >
                    {/* 1. Category */}
                    <td className="py-3.5 px-6">
                      <span
                        className={
                          row.isSummary
                            ? 'text-white font-bold'
                            : 'text-zinc-300'
                        }
                      >
                        {row.category}
                      </span>
                    </td>

                    {/* 2. This Month */}
                    <td className="py-3.5 px-5">
                      <span
                        className={
                          row.isNegative
                            ? 'text-red-400'
                            : row.isSummary
                            ? 'text-yellow-400 font-bold'
                            : 'text-white'
                        }
                      >
                        {row.isNegative ? `-$` : '$'}
                        {row.thisMonth.toLocaleString()}
                      </span>
                    </td>

                    {/* 3. Last Month */}
                    <td className="py-3.5 px-5 text-zinc-400">
                      {row.isNegative ? `-$` : '$'}
                      {row.lastMonth.toLocaleString()}
                    </td>

                    {/* 4. Change */}
                    <td className="py-3.5 px-5">
                      {isNeutral ? (
                        <span className="text-zinc-400 font-medium">0.0%</span>
                      ) : isPositiveChange ? (
                        <span className="text-green-500 font-medium">
                          +{row.changePercent}%
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          {row.changePercent}%
                        </span>
                      )}
                    </td>

                    {/* 5. YTD */}
                    <td className="py-3.5 px-6 text-right font-medium">
                      <span
                        className={
                          row.isNegative
                            ? 'text-red-400'
                            : row.isSummary
                            ? 'text-white font-bold'
                            : 'text-white'
                        }
                      >
                        {row.isNegative ? `-$` : '$'}
                        {row.ytd.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
