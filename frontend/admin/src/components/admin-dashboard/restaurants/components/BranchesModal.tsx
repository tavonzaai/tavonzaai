'use client';

import React from 'react';
import { X, MapPin, Building2, CheckCircle2, ChevronRight, Store } from 'lucide-react';
import { RestaurantBranch } from '../types';

interface BranchesModalProps {
  restaurant: RestaurantBranch | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBranch?: (branchName: string) => void;
}

export default function BranchesModal({
  restaurant,
  isOpen,
  onClose,
  onSelectBranch,
}: BranchesModalProps) {
  if (!isOpen || !restaurant) return null;

  const mockBranchLocations = [
    {
      name: `${restaurant.name} (Main)`,
      area: `${restaurant.city}, ${restaurant.country}`,
      status: 'Open',
      revenue: '$42,850/mo',
      manager: restaurant.manager?.name || 'Sarah Ahmed',
    },
    {
      name: `${restaurant.name} Express`,
      area: 'Airport Concourse Level 2',
      status: 'Open',
      revenue: '$28,400/mo',
      manager: 'David Chen',
    },
    {
      name: `${restaurant.name} Cloud Kitchen`,
      area: 'North Industrial Sector',
      status: 'Delivery Only',
      revenue: '$19,200/mo',
      manager: 'Elena Rostova',
    },
  ];

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100vh-6.5rem)] bg-neutral-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Branch Network</h2>
              <p className="text-xs text-zinc-400">{restaurant.name} • 3 Active Locations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branches list */}
        <div className="p-5 space-y-3">
          {mockBranchLocations.map((branch, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition-colors group cursor-pointer"
              onClick={() => {
                if (onSelectBranch) onSelectBranch(branch.name);
                onClose();
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {branch.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {branch.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span>{branch.area}</span>
                  <span className="text-zinc-600">•</span>
                  <span>Mgr: {branch.manager}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">{branch.revenue}</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
