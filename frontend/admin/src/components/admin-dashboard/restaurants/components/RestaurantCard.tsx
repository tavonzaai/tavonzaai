'use client';

import React from 'react';
import { MapPin, Users, Store, Building2, Utensils, Coffee, Beer, Flame, Cake } from 'lucide-react';
import { RestaurantBranch } from '../types';

interface RestaurantCardProps {
  restaurant: RestaurantBranch;
  onView: (restaurant: RestaurantBranch) => void;
  onEdit: (restaurant: RestaurantBranch) => void;
  onBranches: (restaurant: RestaurantBranch) => void;
}

export default function RestaurantCard({
  restaurant,
  onView,
  onEdit,
  onBranches,
}: RestaurantCardProps) {
  const getTypeIcon = () => {
    switch (restaurant.type) {
      case 'Café':
        return Coffee;
      case 'Bar':
        return Beer;
      case 'Fast Food':
        return Flame;
      case 'Bakery':
        return Cake;
      default:
        return Utensils;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="w-full bg-neutral-900 rounded-[10px] p-4 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-5 shadow-sm group">
      {/* Top Details & Header */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          {/* Logo & Title */}
          <div
            onClick={() => onView(restaurant)}
            className="flex items-center gap-3 cursor-pointer group/title"
            title={`View ${restaurant.name} branches`}
          >
            <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/60 rounded-[10px] flex items-center justify-center text-amber-400 flex-shrink-0 group-hover/title:border-amber-500/40 transition-colors">
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold font-sans leading-5 group-hover/title:text-amber-300 transition-colors line-clamp-1">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-zinc-500 text-sm font-normal">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="truncate">{restaurant.city}, {restaurant.country}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
              restaurant.status === 'Open'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : restaurant.status === 'Opening Soon'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {restaurant.status}
          </div>
        </div>

        {/* Manager & Staff Count Row */}
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-normal pt-1">
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-300 flex-shrink-0">
            {restaurant.manager?.avatar || 'M'}
          </div>
          <span className="truncate text-zinc-400">
            {restaurant.manager?.name || 'Unassigned'} •{' '}
            <span className="text-zinc-500">{restaurant.staffCount || restaurant.assignedStaff?.length || 0} Staff</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
        <button
          type="button"
          onClick={() => onView(restaurant)}
          className="flex-1 h-9 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-[10px] transition-colors flex items-center justify-center cursor-pointer"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(restaurant)}
          className="flex-1 h-9 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-[10px] transition-colors flex items-center justify-center cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onBranches(restaurant)}
          className="flex-1 h-9 px-4 bg-amber-400 hover:bg-amber-300 text-white font-semibold text-xs rounded-[10px] transition-colors flex items-center justify-center cursor-pointer shadow-sm shadow-amber-500/20"
        >
          Branches
        </button>
      </div>
    </div>
  );
}
