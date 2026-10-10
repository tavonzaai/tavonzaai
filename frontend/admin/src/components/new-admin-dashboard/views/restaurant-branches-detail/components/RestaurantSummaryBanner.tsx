import React from 'react';
import { RestaurantItem } from '../../../types';

interface RestaurantSummaryBannerProps {
  restaurant: RestaurantItem;
}

export const RestaurantSummaryBanner: React.FC<RestaurantSummaryBannerProps> = ({ restaurant }) => {
  return (
    <div className="w-full px-4 py-3.5 bg-neutral-900 rounded-xl inline-flex flex-col justify-start items-start gap-3 outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-lg">
      <div className="self-stretch inline-flex justify-between items-center gap-3">
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <span className="text-white text-lg font-semibold font-sans">
              {restaurant.description || 'Modern all-day dining with seasonal plates.'}
            </span>
            <div className="px-2.5 py-1 bg-green-500/10 rounded-md outline outline-1 outline-offset-[-1px] outline-green-500 flex justify-center items-center gap-2.5">
              <span className="text-center text-green-500 text-xs font-medium font-sans leading-4">
                {restaurant.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch inline-flex flex-wrap justify-start items-start gap-4 text-stone-400 text-sm font-normal font-sans tracking-wide">
        <span>{restaurant.email || 'hello@tavonza.com'}</span>
        <span>{restaurant.contactNumber || '+4045017715'}</span>
        <span>{restaurant.address || 'Cusseta, Georgia'}</span>
      </div>
    </div>
  );
};
