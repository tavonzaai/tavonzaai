'use client';

import React from 'react';
import {
  MapPin,
  User,
  Users,
  Utensils,
  Coffee,
  Beer,
  Eye,
  Edit2,
  Settings,
  Store,
} from 'lucide-react';
import { RestaurantBranch } from '../types';

interface RestaurantCardProps {
  restaurant: RestaurantBranch;
  onView: (restaurant: RestaurantBranch) => void;
  onEdit: (restaurant: RestaurantBranch) => void;
  onSettings?: (restaurant: RestaurantBranch) => void;
  onBranches: (restaurant: RestaurantBranch) => void;
}

export default function RestaurantCard({
  restaurant,
  onView,
  onEdit,
  onSettings,
  onBranches,
}: RestaurantCardProps) {
  const getTypeIcon = () => {
    switch (restaurant.type) {
      case 'Café':
        return Coffee;
      case 'Bar':
        return Beer;
      default:
        return Utensils;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 group">
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Title + Location */}
          <div
            onClick={() => onView(restaurant)}
            className="flex items-center gap-3.5 cursor-pointer min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-300 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors shrink-0">
              <TypeIcon className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <h3 className="text-white text-base sm:text-lg font-bold font-['Inter'] leading-tight group-hover:text-amber-300 transition-colors truncate">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-zinc-400 text-xs font-normal">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">{restaurant.address}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
              restaurant.status === 'Open'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                restaurant.status === 'Open' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span>{restaurant.status}</span>
          </div>
        </div>

        {/* Metadata Line from Figma: Sarah Ahmed · 12 Staff · 2 Branches */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span>{restaurant.manager?.name || 'Manager'}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{restaurant.staffCount} Staff</span>
          <span className="text-zinc-600">•</span>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Store className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              {restaurant.branchesCount === 1
                ? '1 Branch'
                : `${restaurant.branchesCount ?? 0} Branches`}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Action Buttons in 2 Rows (From Figma Image 1) */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        {/* Row 1: View (outline) & Edit (outline) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onView(restaurant)}
            className="h-9 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-zinc-600 text-zinc-100 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(restaurant)}
            className="h-9 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-zinc-600 text-zinc-100 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit</span>
          </button>
        </div>

        {/* Row 2: Settings (outline) & Branches (black filled button) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => (onSettings ? onSettings(restaurant) : onEdit(restaurant))}
            className="h-9 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-zinc-600 text-zinc-100 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onBranches(restaurant)}
            className="h-9 px-3 bg-black hover:bg-zinc-950 text-white border border-zinc-700/80 hover:border-amber-400/50 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Branches</span>
          </button>
        </div>
      </div>
    </div>
  );
}
