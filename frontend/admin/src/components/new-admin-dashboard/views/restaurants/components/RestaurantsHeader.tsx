import React from 'react';
import { Plus } from 'lucide-react';

interface RestaurantsHeaderProps {
  onCreateClick: () => void;
}

export const RestaurantsHeader: React.FC<RestaurantsHeaderProps> = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="inline-flex flex-col justify-start items-start gap-1">
        <h1 className="text-white text-3xl font-semibold font-sans leading-9">
          Restaurants
        </h1>
        <p className="text-zinc-500 text-base font-normal font-sans leading-6">
          Manage every restaurant brand within your organization.
        </p>
      </div>

      <div className="flex justify-end items-start gap-2">
        <button
          onClick={onCreateClick}
          className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-sans leading-5 shadow-sm cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5] text-neutral-900" />
          <span>Create Restaurant</span>
        </button>
      </div>
    </div>
  );
};
