'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Building2,
  MapPin,
  Users,
  Store,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { RestaurantBranch, BranchItem } from '../types';
import { INITIAL_BRANCHES } from '../restaurantsData';
import CreateBranchModal from './CreateBranchModal';

interface BranchesViewProps {
  restaurant: RestaurantBranch;
  onBack: () => void;
  onGoToRestaurants?: () => void;
  setSelectedBranch?: (branch: string) => void;
  selectedBranch?: string;
}

export default function BranchesView({
  restaurant,
  onBack,
  onGoToRestaurants,
  setSelectedBranch,
  selectedBranch,
}: BranchesViewProps) {
  const [branches, setBranches] = useState<BranchItem[]>(() => {
    return (
      INITIAL_BRANCHES[restaurant.id] || [
        {
          id: `b-${restaurant.id}-1`,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          name: `${restaurant.name} Uttara`,
          address: 'Sector 3, Jashimuddin Avenue',
          city: 'Uttara',
          country: 'Dhaka',
          postalCode: '1230',
          phone: '+880 2-8911223',
          email: 'uttara@tavonza.com',
          status: 'Open',
          manager: {
            id: 'bmgr-1',
            name: 'Arif Hossain',
            role: 'Branch Manager',
            email: 'arif@tavonza.com',
            avatar: 'AH',
          },
          staffCount: 7,
          assignedStaff: [],
          revenue: '$22,400/mo',
        },
        {
          id: `b-${restaurant.id}-2`,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          name: `${restaurant.name} Banani`,
          address: 'Block E, Road 11',
          city: 'Banani',
          country: 'Dhaka',
          postalCode: '1213',
          phone: '+880 2-9844556',
          email: 'banani@tavonza.com',
          status: 'Closed',
          manager: {
            id: 'bmgr-2',
            name: 'Arif Hossain',
            role: 'Branch Manager',
            email: 'arif@tavonza.com',
            avatar: 'AH',
          },
          staffCount: 7,
          assignedStaff: [],
          revenue: '$18,900/mo',
        },
        {
          id: `b-${restaurant.id}-3`,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          name: `${restaurant.name} Mirpur`,
          address: 'Mirpur 10 Circle',
          city: 'Mirpur',
          country: 'Dhaka',
          postalCode: '1216',
          phone: '+880 2-9011223',
          email: 'mirpur@tavonza.com',
          status: 'Open',
          manager: {
            id: 'bmgr-3',
            name: 'Arif Hossain',
            role: 'Branch Manager',
            email: 'arif@tavonza.com',
            avatar: 'AH',
          },
          staffCount: 7,
          assignedStaff: [],
          revenue: '$24,100/mo',
        },
      ]
    );
  });

  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);

  const handleBranchCreated = (newBranch: BranchItem) => {
    setBranches((prev) => [newBranch, ...prev]);
  };

  const handleSelectBranch = (branch: BranchItem) => {
    setSelectedBranch?.(branch.name);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('branch', branch.name);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <>
      <div
        className={`w-full space-y-6 animate-in fade-in duration-200 pb-16 transition-all duration-300 ${
          isCreateBranchOpen ? 'filter blur-[3px] pointer-events-none select-none opacity-80' : ''
        }`}
      >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH BACK BUTTON */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Back Button matching Figma size-10 bg-white rounded-[10px] */}
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 bg-white hover:bg-stone-200 rounded-[10px] flex items-center justify-center text-black flex-shrink-0 transition-all cursor-pointer shadow-md"
            title="Back to Restaurants"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-white text-2xl sm:text-3xl font-semibold font-sans leading-9">
                Branches .
              </h1>
              <span className="text-white text-base sm:text-lg font-normal">
                {restaurant.name}
              </span>
            </div>
            <p className="text-zinc-500 text-sm sm:text-base font-normal mt-0.5 leading-6">
              Manage branch locations for this restaurant.
            </p>
          </div>
        </div>

        {/* Create Branch Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateBranchOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,0.60)] flex items-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-semibold leading-5">Create Branch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PARENT RESTAURANT SUMMARY BAR (Matches Figma Snippet) */}
      {/* ========================================================================= */}
      <div className="w-full bg-neutral-900 border border-zinc-800 rounded-[10px] p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center text-black flex-shrink-0">
            <Building2 className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <div className="text-white text-base font-semibold leading-5">
              {restaurant.name}
            </div>
            <div className="text-zinc-500 text-base font-normal mt-0.5 leading-6">
              {restaurant.city}, {restaurant.country} · {restaurant.type}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-white text-base font-normal leading-6">
            {branches.length} Branches .
          </span>
          <div className="px-3 py-1.5 bg-green-400/30 text-green-500 rounded-[49px] text-base font-medium leading-5 border border-green-500/20">
            {restaurant.status}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BRANCH CARDS GRID (Matches Figma Snippet) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {branches.map((branch) => {
          const isSelectedInHeader = selectedBranch === branch.name;
          return (
            <div
              key={branch.id}
              onClick={() => handleSelectBranch(branch)}
              className={`w-full bg-neutral-900 rounded-[10px] p-4 flex flex-col justify-between gap-5 transition-all shadow-sm group cursor-pointer border ${
                isSelectedInHeader
                  ? 'border-amber-400/90 ring-1 ring-amber-400/40'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
              title={`Click to set ${branch.name} in top header`}
            >
              <div className="flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center text-neutral-800 flex-shrink-0">
                      <Store className="w-5 h-5 text-neutral-700" />
                    </div>
                    <div>
                      <h3 className="text-white text-base font-semibold leading-5 group-hover:text-amber-300 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 text-zinc-500 text-sm font-normal">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span>{branch.city}, {branch.country}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-[49px] text-base font-medium leading-5 border flex-shrink-0 ${
                      branch.status === 'Open'
                        ? 'bg-green-400/30 text-green-500 border-green-500/30'
                        : 'bg-red-500/20 text-red-500 border-red-500/30'
                    }`}
                  >
                    {branch.status}
                  </div>
                </div>

                {/* Manager & Staff Row (Matches Figma "SArif Hossain . 7 Staff") */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-normal leading-6">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span>{branch.manager?.name || 'Arif Hossain'} . {branch.staffCount} Staff</span>
                  </div>
                  {isSelectedInHeader && (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-400/15 text-amber-400 rounded-full border border-amber-400/30 font-medium">
                      In Header
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Branch Card (Matches Figma Snippet) */}
        <button
          type="button"
          onClick={() => setIsCreateBranchOpen(true)}
          className="w-full min-h-[112px] bg-white/5 hover:bg-white/10 rounded-2xl border border-stone-300/40 hover:border-amber-400/70 flex flex-col items-center justify-center p-4 gap-2 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-10 h-10 bg-stone-200 group-hover:bg-amber-400 rounded-full flex items-center justify-center text-stone-700 group-hover:text-white transition-colors shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-stone-400 group-hover:text-white text-sm font-medium leading-5 transition-colors">
            Add Branch
          </div>
        </button>
      </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CREATE BRANCH MODAL (Rendered outside blurred page content) */}
      {/* ========================================================================= */}
      <CreateBranchModal
        isOpen={isCreateBranchOpen}
        onClose={() => setIsCreateBranchOpen(false)}
        restaurant={restaurant}
        onSuccess={handleBranchCreated}
        onGoToRestaurants={onGoToRestaurants || onBack}
      />
    </>
  );
}
