'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  Plus,
  Building2,
  MapPin,
  Users,
  Store,
  Eye,
  Edit2,
  Settings,
} from 'lucide-react';
import { RestaurantBranch, BranchItem } from '../types';
import { INITIAL_BRANCHES } from '../restaurantsData';
import CreateBranchModal from './CreateBranchModal';
import BranchDetailView from './BranchDetailView';
import EditBranchModal from './EditBranchModal';
import BranchSettingsView from './BranchSettingsView';
import { restaurantService } from '@/redux/features/restaurantApi';

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
          name: `Tavonza Uttara`,
          address: 'Uttara, Dhaka',
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
          revenue: '৳24,500/day',
        },
        {
          id: `b-${restaurant.id}-2`,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          name: `Tavonza Mirpur`,
          address: 'Mirpur, Dhaka',
          city: 'Mirpur',
          country: 'Dhaka',
          postalCode: '1216',
          phone: '+880 2-9011223',
          email: 'mirpur@tavonza.com',
          status: 'Closed',
          manager: {
            id: 'bmgr-2',
            name: 'Priya Sen',
            role: 'Branch Manager',
            email: 'priya@tavonza.com',
            avatar: 'PS',
          },
          staffCount: 5,
          assignedStaff: [],
          revenue: '৳0/day',
        },
      ]
    );
  });

  useEffect(() => {
    let mounted = true;
    async function loadBackendBranches() {
      try {
        const res = await restaurantService.getBranches({ restaurantId: restaurant.id });
        if (mounted && res.data && res.data.length > 0) {
          const mapped: BranchItem[] = res.data.map((b) => {
            const addr =
              typeof b.address === 'object' && b.address
                ? b.address.line1 || b.address.city || 'Branch Location'
                : String(b.address || 'Branch Location');
            const city =
              typeof b.address === 'object' && b.address ? b.address.city || 'City' : 'City';
            const country =
              typeof b.address === 'object' && b.address ? b.address.country || 'Country' : 'Country';
            return {
              id: b.id,
              restaurantId: b.restaurantId || restaurant.id,
              restaurantName: restaurant.name,
              name: b.name,
              address: addr,
              city,
              country,
              phone: b.phone || '',
              status: b.isActive ? 'Open' : 'Closed',
              manager: {
                id: 'bmgr-1',
                name: 'Branch Manager',
                role: 'Branch Manager',
                email: 'manager@tavonza.com',
                avatar: 'BM',
              },
              staffCount: 6,
              assignedStaff: [],
              revenue: '$1,200/day',
            };
          });
          setBranches(mapped);
        }
      } catch (err) {
        console.warn('Could not load backend branches, using local baseline:', err);
      }
    }
    loadBackendBranches();
    return () => {
      mounted = false;
    };
  }, [restaurant.id, restaurant.name]);

  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [selectedBranchForDetail, setSelectedBranchForDetail] = useState<BranchItem | null>(null);
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState<BranchItem | null>(null);
  const [selectedBranchForSettings, setSelectedBranchForSettings] = useState<BranchItem | null>(null);

  const handleBranchCreated = (newBranch: BranchItem) => {
    setBranches((prev) => [newBranch, ...prev]);
  };

  const handleBranchUpdated = (updated: BranchItem) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBranchForDetail && selectedBranchForDetail.id === updated.id) {
      setSelectedBranchForDetail(updated);
    }
  };

  const handleSelectBranch = (branch: BranchItem) => {
    setSelectedBranch?.(branch.name);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('branch', branch.name);
      window.history.pushState({}, '', url.toString());
    }
  };

  // If viewing Branch Settings view (Figma 4 Tabs: General, Notifications, Permissions, Danger Zone)
  if (selectedBranchForSettings) {
    return (
      <BranchSettingsView
        branch={selectedBranchForSettings}
        parentRestaurant={restaurant}
        onBack={() => setSelectedBranchForSettings(null)}
        onSave={handleBranchUpdated}
        onDeleteBranch={(id) => {
          setBranches((prev) => prev.filter((b) => b.id !== id));
          setSelectedBranchForSettings(null);
          if (selectedBranchForDetail && selectedBranchForDetail.id === id) {
            setSelectedBranchForDetail(null);
          }
        }}
      />
    );
  }

  // If viewing a single branch detail page (Figma Image 4)
  if (selectedBranchForDetail) {
    return (
      <BranchDetailView
        branch={selectedBranchForDetail}
        parentRestaurant={restaurant}
        onBack={() => setSelectedBranchForDetail(null)}
        onSettings={(b) => setSelectedBranchForSettings(b)}
      />
    );
  }

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
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
              title="Back to Restaurants"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-white text-xl sm:text-2xl font-serif font-bold tracking-tight leading-tight">
                  Branches
                </h1>
                <span className="text-zinc-400 text-sm font-medium">
                  • {restaurant.name}
                </span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
                Manage branch locations for this restaurant.
              </p>
            </div>
          </div>

          {/* Create Branch Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateBranchOpen(true)}
              className="h-10 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/15"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Branch</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PARENT RESTAURANT SUMMARY BAR (Matches Figma Snippet Image 2 & 3) */}
        {/* ========================================================================= */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/80 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white text-base font-bold font-serif leading-tight">
                {restaurant.name}
              </div>
              <div className="text-zinc-400 text-xs mt-0.5">
                {restaurant.address || `${restaurant.city}, ${restaurant.country}`} • {restaurant.type}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-zinc-300 text-xs font-medium">
              {branches.length} Branches
            </span>
            <span className="text-zinc-600">•</span>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">
              {restaurant.status}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BRANCH CARDS GRID (Matches Figma Image 2 & 3) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((branch) => {
            const isSelectedInHeader = selectedBranch === branch.name;
            return (
              <div
                key={branch.id}
                className={`w-full bg-zinc-900/90 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all shadow-md group border ${
                  isSelectedInHeader
                    ? 'border-amber-400/90 ring-1 ring-amber-400/40'
                    : 'border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col gap-3.5">
                  {/* Top line: Icon + Name + Location + Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/80 rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-amber-400 transition-colors shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white text-base font-bold group-hover:text-amber-300 transition-colors truncate">
                          {branch.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5 text-zinc-400 text-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{branch.address || `${branch.city}, ${branch.country}`}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${
                        branch.status === 'Open'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                      }`}
                    >
                      {branch.status}
                    </div>
                  </div>

                  {/* Manager & Staff Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{branch.manager?.name || 'Arif Hossain'} • {branch.staffCount || 7} Staff</span>
                    </div>
                    {isSelectedInHeader && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-400/15 text-amber-400 rounded-full border border-amber-400/30 font-medium">
                        Active Header
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row (Image 2 & 3: View, Edit, Settings) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                  {/* View Button (Circled in Red in Image 3) */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectBranch(branch);
                      setSelectedBranchForDetail(branch);
                    }}
                    className="h-9 px-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedBranchForEdit(branch)}
                    className="h-9 px-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Edit</span>
                  </button>

                  {/* Settings Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedBranchForSettings(branch)}
                    className="h-9 px-2 bg-black hover:bg-zinc-950 border border-zinc-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Branch Dashed Card (Matches Figma Image 2 & 3) */}
          <div
            onClick={() => setIsCreateBranchOpen(true)}
            className="border-2 border-dashed border-zinc-800 hover:border-amber-500/60 rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center gap-2.5 transition-all duration-300 hover:bg-zinc-900/40 cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 group-hover:bg-amber-500/20 border border-zinc-800 group-hover:border-amber-500/40 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">
              Add Branch
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CREATE BRANCH MODAL */}
      {/* ========================================================================= */}
      <CreateBranchModal
        isOpen={isCreateBranchOpen}
        onClose={() => setIsCreateBranchOpen(false)}
        restaurant={restaurant}
        onSuccess={handleBranchCreated}
        onGoToRestaurants={onGoToRestaurants || onBack}
      />

      <EditBranchModal
        isOpen={!!selectedBranchForEdit}
        onClose={() => setSelectedBranchForEdit(null)}
        branch={selectedBranchForEdit}
        onSave={handleBranchUpdated}
      />
    </>
  );
}
