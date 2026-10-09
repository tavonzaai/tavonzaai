import React from 'react';
import { Eye } from 'lucide-react';
import { BranchPerformanceRecord } from '../types';

interface BranchPerformanceTableProps {
  records: BranchPerformanceRecord[];
  totalRecordsCount: number;
  onInspectBranch: (branch: BranchPerformanceRecord) => void;
}

export const BranchPerformanceTable: React.FC<BranchPerformanceTableProps> = ({
  records,
  totalRecordsCount,
  onInspectBranch,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-lg font-semibold font-sans">
            Branch Performance Comparison
          </h3>
          <p className="text-neutral-400 text-xs font-sans mt-0.5">
            Comparative order volume, total revenue, average check, and growth momentum.
          </p>
        </div>
        <span className="text-xs text-neutral-500 font-sans">
          Showing {records.length} of {totalRecordsCount} branches
        </span>
      </div>

      {/* The Exact Figma Styled Table with individual column styling */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-neutral-950/60 shadow-xl">
        <table className="w-full text-left font-sans">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold">
              <th className="px-5 py-3.5">Branch</th>
              <th className="px-5 py-3.5 text-right">Orders</th>
              <th className="px-5 py-3.5 text-right">Revenue</th>
              <th className="px-5 py-3.5 text-right">Avg. order</th>
              <th className="px-5 py-3.5 text-right">Growth</th>
              <th className="px-5 py-3.5 text-center">Performance</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                  No branches match the selected filters.
                </td>
              </tr>
            ) : (
              records.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-neutral-900/60 transition-colors group"
                >
                  {/* 1. Branch Column */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col justify-center items-start gap-1">
                      <span className="text-neutral-200 text-base font-medium font-sans leading-4 group-hover:text-amber-300 transition-colors">
                        {b.name}
                      </span>
                      <span className="text-neutral-400 text-[10px] font-normal leading-4 tracking-tight">
                        {b.location}
                      </span>
                    </div>
                  </td>

                  {/* 2. Orders Column */}
                  <td className="px-5 py-4 text-right">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                      {b.orders.toLocaleString()}
                    </span>
                  </td>

                  {/* 3. Revenue Column */}
                  <td className="px-5 py-4 text-right">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                      {b.revenueFormatted}
                    </span>
                  </td>

                  {/* 4. Avg. order Column */}
                  <td className="px-5 py-4 text-right">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                      {b.avgOrderFormatted}
                    </span>
                  </td>

                  {/* 5. Growth Column */}
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-base font-medium font-sans leading-4 ${
                        b.growth >= 0 ? 'text-green-500' : 'text-red-400'
                      }`}
                    >
                      {b.growthFormatted}
                    </span>
                  </td>

                  {/* 6. Performance Badge Column */}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-sans leading-4 ${
                        b.performance === 'Excellent' || b.performance === 'Strong'
                          ? 'bg-green-500/10 text-green-500'
                          : b.performance === 'Review'
                          ? 'bg-orange-400/10 text-orange-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {b.performance}
                    </span>
                  </td>

                  {/* 7. Action Button Column */}
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => onInspectBranch(b)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      title="View Detailed Branch Breakdown"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
