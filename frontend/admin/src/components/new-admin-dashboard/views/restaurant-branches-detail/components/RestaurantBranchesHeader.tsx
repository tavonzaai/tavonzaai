import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface RestaurantBranchesHeaderProps {
  restaurantName: string;
  onBack: () => void;
  onCreateBranchClick: () => void;
}

export const RestaurantBranchesHeader: React.FC<RestaurantBranchesHeaderProps> = ({
  restaurantName,
  onBack,
  onCreateBranchClick,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Navigation Row: Back Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-sans leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Create Branch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-1">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            {restaurantName}
          </h1>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Restaurant details and branch management.
          </p>
        </div>

        <div className="flex justify-end items-start gap-2">
          <button
            onClick={onCreateBranchClick}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-sans leading-5 shadow-sm cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5] text-neutral-900" />
            <span>Create Branch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
