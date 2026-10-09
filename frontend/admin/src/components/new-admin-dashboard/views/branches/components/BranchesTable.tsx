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
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[960px] inline-flex justify-start items-stretch">
        {/* Column 1: Branch */}
        <div className="w-48 inline-flex flex-col justify-start items-stretch">
          <div className="px-4 py-3 bg-zinc-900 rounded-tl-lg border-l border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Branch
            </span>
          </div>
          {branches.map((branch, idx) => {
            const isLast = idx === branches.length - 1;
            return (
              <div
                key={branch.id}
                className={`px-4 py-4 border-l border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px] ${
                  isLast ? 'rounded-bl-lg' : ''
                }`}
              >
                <button
                  onClick={() => onViewBranch(branch)}
                  className="inline-flex flex-col justify-center items-start gap-1 text-left group cursor-pointer"
                >
                  <span className="text-neutral-200 group-hover:text-amber-400 transition-colors text-base font-medium font-['Inter'] leading-4">
                    {branch.name}
                  </span>
                  <span className="text-neutral-400 text-[10px] font-normal font-['SF_Pro'] leading-4 tracking-tight">
                    {branch.location}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Column 2: Restaurant */}
        <div className="w-52 inline-flex flex-col justify-start items-stretch">
          <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Restaurant
            </span>
          </div>
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
            >
              <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                {branch.restaurantName}
              </span>
            </div>
          ))}
        </div>

        {/* Column 3: Branch Manager */}
        <div className="w-44 inline-flex flex-col justify-start items-stretch">
          <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Branch Manager
            </span>
          </div>
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
            >
              <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                {branch.manager}
              </span>
            </div>
          ))}
        </div>

        {/* Column 4: Operating hours */}
        <div className="w-48 inline-flex flex-col justify-start items-stretch">
          <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Operating hours
            </span>
          </div>
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
            >
              <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                {branch.hours || `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
              </span>
            </div>
          ))}
        </div>

        {/* Column 5: Payment Status / Status */}
        <div className="w-40 inline-flex flex-col justify-start items-stretch">
          <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-center items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Payment Status
            </span>
          </div>
          {branches.map((branch) => {
            const isActive = branch.status === 'Active';
            const isSetup = branch.status === 'Setup';

            return (
              <div
                key={branch.id}
                className="px-4 py-4 border-b border-zinc-800 flex justify-center items-center gap-2.5 h-[72px]"
              >
                <div
                  className={`px-3 py-1.5 rounded-md flex justify-center items-center gap-2.5 ${
                    isActive
                      ? 'bg-green-500/10'
                      : isSetup
                      ? 'bg-orange-400/10'
                      : 'bg-red-400/10'
                  }`}
                >
                  <span
                    className={`text-sm font-medium font-['Inter'] leading-4 ${
                      isActive
                        ? 'text-green-500'
                        : isSetup
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {branch.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column 6: Action */}
        <div className="w-36 inline-flex flex-col justify-start items-stretch">
          <div className="p-3 bg-zinc-900 rounded-tr-lg border-r border-t border-b border-zinc-800 flex justify-center items-center gap-2.5 h-11">
            <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
              Action
            </span>
          </div>
          {branches.map((branch, idx) => {
            const isLast = idx === branches.length - 1;
            return (
              <div
                key={branch.id}
                className={`px-3 py-6 border-r border-b border-zinc-800 flex justify-center items-center gap-3.5 h-[72px] ${
                  isLast ? 'rounded-br-lg' : ''
                }`}
              >
                {/* View action button */}
                <button
                  onClick={() => onViewBranch(branch)}
                  className="p-1 hover:text-amber-400 text-neutral-400 transition-colors cursor-pointer"
                  aria-label={`View dashboard for ${branch.name}`}
                  title="View branch dashboard"
                >
                  <Eye className="size-4" />
                </button>

                {/* Edit button */}
                <button
                  onClick={() => onEditBranch(branch)}
                  className="p-1 hover:text-white text-neutral-400 transition-colors cursor-pointer"
                  aria-label={`Edit ${branch.name}`}
                  title="Edit branch"
                >
                  <Pencil className="size-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteBranch(branch)}
                  className="p-1 hover:text-red-400 text-neutral-400 transition-colors cursor-pointer"
                  aria-label={`Delete ${branch.name}`}
                  title="Delete branch"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
