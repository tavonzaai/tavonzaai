'use client';

import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { BranchItem } from '../../../types';

interface BranchesTableProps {
  branches: BranchItem[];
  onViewBranch: (branch: BranchItem) => void;
  onEditBranch: (branch: BranchItem) => void;
  onDeleteBranch: (branch: BranchItem) => void;
}

export const BranchesTable: React.FC<BranchesTableProps> = ({
  branches,
  onViewBranch,
  onEditBranch,
  onDeleteBranch,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-950/60 shadow-xl">
      <table className="w-full text-left font-['Inter'] border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold">
            <th className="px-6 py-4 text-left">Branch</th>
            <th className="px-6 py-4 text-left">Restaurant</th>
            <th className="px-6 py-4 text-left">Branch Manager</th>
            <th className="px-6 py-4 text-left">Operating hours</th>
            <th className="px-6 py-4 text-center">Payment Status</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-zinc-800">
          {branches.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                No branches found matching your search.
              </td>
            </tr>
          ) : (
            branches.map((branch) => {
              const isActive = branch.status === 'Active';
              const isSetup = branch.status === 'Setup';

              return (
                <tr
                  key={branch.id}
                  className="hover:bg-neutral-900/50 transition-colors group"
                >
                  {/* Column 1: Branch */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewBranch(branch)}
                      className="inline-flex flex-col justify-center items-start text-left group/btn cursor-pointer"
                    >
                      <span className="text-neutral-200 group-hover/btn:text-amber-400 transition-colors text-base font-medium leading-5">
                        {branch.name}
                      </span>
                      <span className="text-neutral-400 text-xs font-normal tracking-tight mt-0.5">
                        {branch.location}
                      </span>
                    </button>
                  </td>

                  {/* Column 2: Restaurant */}
                  <td className="px-6 py-4">
                    <span className="text-neutral-200 text-base font-medium leading-5">
                      {branch.restaurantName}
                    </span>
                  </td>

                  {/* Column 3: Branch Manager */}
                  <td className="px-6 py-4">
                    <span className="text-neutral-200 text-base font-medium leading-5">
                      {branch.manager}
                    </span>
                  </td>

                  {/* Column 4: Operating hours */}
                  <td className="px-6 py-4">
                    <span className="text-neutral-200 text-base font-medium leading-5 font-mono text-sm">
                      {branch.hours ||
                        `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
                    </span>
                  </td>

                  {/* Column 5: Payment Status / Status Badge */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex justify-center items-center">
                      <span
                        className={`px-3 py-1.5 rounded-md text-sm font-medium leading-4 ${
                          isActive
                            ? 'bg-green-500/10 text-green-500'
                            : isSetup
                            ? 'bg-orange-400/10 text-orange-400'
                            : 'bg-red-400/10 text-red-400'
                        }`}
                      >
                        {branch.status}
                      </span>
                    </div>
                  </td>

                  {/* Column 6: Action */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-3">
                      {/* View action button */}
                      <button
                        onClick={() => onViewBranch(branch)}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                        aria-label={`View dashboard for ${branch.name}`}
                        title="View branch dashboard"
                      >
                        <Eye className="size-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => onEditBranch(branch)}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                        aria-label={`Edit ${branch.name}`}
                        title="Edit branch"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteBranch(branch)}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                        aria-label={`Delete ${branch.name}`}
                        title="Delete branch"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
