import React from 'react';
import { GitBranch, Pencil, Trash2 } from 'lucide-react';
import { RestaurantItem } from '../../../types';

interface RestaurantCardProps {
  restaurant: RestaurantItem;
  onSelect: (rest: RestaurantItem) => void;
  onEdit: (rest: RestaurantItem) => void;
  onDelete: (rest: RestaurantItem) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isSetup = restaurant.status === 'Setup';
  const isActive = restaurant.status === 'Active' || restaurant.status === 'Open';

  return (
    <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-4 transition-all hover:border-neutral-700 shadow-xl">
      {/* Card Top: Title & Status Badge */}
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center gap-2">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                <button
                  onClick={() => onSelect(restaurant)}
                  className="text-left group cursor-pointer"
                >
                  <h2 className="self-stretch text-white text-lg font-medium font-sans leading-5 group-hover:text-amber-400 transition-colors">
                    {restaurant.name}
                  </h2>
                </button>
              </div>
              <p className="self-stretch text-neutral-400 text-xs font-normal font-sans leading-4">
                {restaurant.description || restaurant.tagline || 'Modern dining with seasonal plates.'}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`px-2.5 py-2 rounded-lg flex justify-center items-center gap-2.5 ${
            isActive
              ? 'bg-green-500/10'
              : isSetup
              ? 'bg-orange-500/10'
              : 'bg-red-400/10'
          }`}
        >
          <span
            className={`text-center text-xs font-medium font-sans leading-4 ${
              isActive
                ? 'text-green-500'
                : isSetup
                ? 'text-orange-500'
                : 'text-red-400'
            }`}
          >
            {restaurant.status}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

      {/* Branch count row */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
        <div className="self-stretch inline-flex justify-start items-center">
          <button
            onClick={() => onSelect(restaurant)}
            className="flex justify-start items-center gap-3 cursor-pointer group"
          >
            <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex justify-center items-center group-hover:bg-yellow-500/20 transition-colors">
              <GitBranch className="size-4 text-yellow-500" />
            </div>
            <div className="flex justify-start items-center">
              <span className="text-yellow-500 text-lg font-normal font-sans leading-5 group-hover:underline">
                {restaurant.branchesCount} branches
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

      {/* Action buttons row */}
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <button
          onClick={() => onSelect(restaurant)}
          className="flex-1 px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="text-center text-white text-sm font-medium font-sans leading-4">
            View details
          </span>
        </button>

        <div className="flex justify-start items-center gap-2">
          {/* Edit button */}
          <button
            onClick={() => onEdit(restaurant)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition-colors cursor-pointer"
            aria-label={`Edit ${restaurant.name}`}
          >
            <Pencil className="size-4 text-stone-300" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(restaurant)}
            className="p-2 bg-red-400/20 hover:bg-red-400/30 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 flex justify-center items-center transition-colors cursor-pointer"
            aria-label={`Delete ${restaurant.name}`}
          >
            <Trash2 className="size-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
