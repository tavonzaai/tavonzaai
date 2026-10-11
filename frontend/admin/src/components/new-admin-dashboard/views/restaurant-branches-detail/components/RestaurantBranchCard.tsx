import React from 'react';
import { GitBranch, Pencil, Trash2 } from 'lucide-react';
import { BranchItem } from '../../../types';

interface RestaurantBranchCardProps {
  branch: BranchItem;
  onOpenDashboard: (branch: BranchItem) => void;
  onEdit: (branch: BranchItem) => void;
  onDelete: (branch: BranchItem) => void;
}

export const RestaurantBranchCard: React.FC<RestaurantBranchCardProps> = ({
  branch,
  onOpenDashboard,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full sm:w-[360px] p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 inline-flex flex-col justify-start items-start gap-4 transition-all hover:border-neutral-700 shadow-xl">
      {/* Branch Header: Icon + Name & Location + Status Badge */}
      <div className="self-stretch inline-flex justify-start items-center gap-3">
        <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex justify-center items-center">
          <GitBranch className="size-4 text-yellow-500" />
        </div>

        <div className="flex-1 flex justify-between items-center">
          <div className="flex-1 flex flex-col justify-start items-start gap-0.5">
            <h3 className="self-stretch text-white text-lg font-medium font-sans leading-5">
              {branch.name}
            </h3>
            <span className="self-stretch text-neutral-400 text-xs font-normal font-sans leading-4">
              {branch.location}
            </span>
          </div>

          <div className="px-2.5 py-2 bg-green-500/10 rounded-lg flex justify-center items-center gap-2.5">
            <span className="text-center text-green-500 text-xs font-medium font-sans leading-4">
              {branch.status}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

      {/* Branch Metadata: Manager & Hours */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div className="self-stretch inline-flex justify-between items-center">
          <span className="text-zinc-400 text-base font-medium font-sans leading-9">
            Manager
          </span>
          <span className="text-neutral-200 text-base font-normal font-sans leading-4">
            {branch.manager}
          </span>
        </div>

        <div className="self-stretch inline-flex justify-between items-center">
          <span className="text-zinc-400 text-base font-medium font-sans leading-9">
            Hours
          </span>
          <span className="text-neutral-200 text-base font-normal font-sans leading-4">
            {branch.hours || `${branch.openingTime || '09:00'}–${branch.closingTime || '23:00'}`}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

      {/* Bottom Actions Row */}
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <button
          onClick={() => onOpenDashboard(branch)}
          className="flex-1 px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="text-center text-white text-sm font-medium font-sans leading-4">
            Open branch dashboard
          </span>
        </button>

        <div className="flex justify-start items-center gap-2">
          {/* Edit button */}
          <button
            onClick={() => onEdit(branch)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition-colors cursor-pointer"
            aria-label={`Edit ${branch.name}`}
          >
            <Pencil className="size-4 text-stone-300" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(branch)}
            className="p-2 bg-red-400/20 hover:bg-red-400/30 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 flex justify-center items-center transition-colors cursor-pointer"
            aria-label={`Delete ${branch.name}`}
          >
            <Trash2 className="size-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
