'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Store, Building2, Utensils, Filter } from 'lucide-react';
import { RestaurantBranch } from './types';
import { INITIAL_RESTAURANTS } from './restaurantsData';
import RestaurantCard from './components/RestaurantCard';
import RestaurantDetailView from './components/RestaurantDetailView';
import CreateRestaurantModal from './components/CreateRestaurantModal';
import EditRestaurantModal from './components/EditRestaurantModal';
import RestaurantSettingsView from './components/RestaurantSettingsView';
import BranchesView from './components/BranchesView';

interface RestaurantsViewProps {
  initialBranchRestaurantId?: string;
  setSelectedBranch?: (branch: string) => void;
  selectedBranch?: string;
}

export default function RestaurantsView({
  initialBranchRestaurantId,
  setSelectedBranch,
  selectedBranch,
}: RestaurantsViewProps) {
  const [restaurants, setRestaurants] = useState<RestaurantBranch[]>(INITIAL_RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');

  // Modals & Active Views state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<RestaurantBranch | null>(null);
  const [activeSettingsRestaurant, setActiveSettingsRestaurant] = useState<RestaurantBranch | null>(null);
  const [activeBranchesRestaurant, setActiveBranchesRestaurant] = useState<RestaurantBranch | null>(null);

  // Active restaurant for Detail View (Figma Images 2, 3, 4, 5)
  const [activeDetailRestaurant, setActiveDetailRestaurant] = useState<RestaurantBranch | null>(() => {
    if (initialBranchRestaurantId) {
      return INITIAL_RESTAURANTS.find((r) => r.id === initialBranchRestaurantId) || null;
    }
    return null;
  });

  const [detailTab, setDetailTab] = useState<'overview' | 'branches' | 'staff' | 'menu' | 'analytics'>('overview');

  // Summary counts (From Figma Image 1)
  const totalCount = restaurants.length;
  const openCount = restaurants.filter((r) => r.status === 'Open').length;
  const closedCount = restaurants.filter((r) => r.status === 'Closed').length;
  const totalBranches = restaurants.reduce(
    (acc, r) => acc + (r.branchesCount ?? (r.branchesList?.length || 0)),
    0
  );

  // Filter restaurants by search and status
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesStatus =
        statusFilter === 'All' || restaurant.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.address.toLowerCase().includes(q) ||
        restaurant.city.toLowerCase().includes(q) ||
        restaurant.country.toLowerCase().includes(q) ||
        (restaurant.manager?.name && restaurant.manager.name.toLowerCase().includes(q)) ||
        restaurant.type.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [restaurants, searchQuery, statusFilter]);

  const handleRestaurantCreated = (newRestaurant: RestaurantBranch) => {
    setRestaurants((prev) => [newRestaurant, ...prev]);
  };

  const handleRestaurantUpdated = (updated: RestaurantBranch) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    if (activeDetailRestaurant && activeDetailRestaurant.id === updated.id) {
      setActiveDetailRestaurant(updated);
    }
    if (activeSettingsRestaurant && activeSettingsRestaurant.id === updated.id) {
      setActiveSettingsRestaurant(updated);
    }
    if (activeBranchesRestaurant && activeBranchesRestaurant.id === updated.id) {
      setActiveBranchesRestaurant(updated);
    }
  };

  // If viewing Branches Management view (Figma Image 2 & 3: Manage Branches)
  if (activeBranchesRestaurant) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <BranchesView
          restaurant={activeBranchesRestaurant}
          onBack={() => setActiveBranchesRestaurant(null)}
          setSelectedBranch={setSelectedBranch}
          selectedBranch={selectedBranch}
        />
      </div>
    );
  }

  // If viewing Restaurant Settings view (Figma 5 Tabs: General, Notifications, Integrations, Permissions, Danger Zone)
  if (activeSettingsRestaurant) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <RestaurantSettingsView
          restaurant={activeSettingsRestaurant}
          onBack={() => setActiveSettingsRestaurant(null)}
          onSave={handleRestaurantUpdated}
          onDeleteRestaurant={(id) => {
            setRestaurants((prev) => prev.filter((r) => r.id !== id));
            setActiveSettingsRestaurant(null);
          }}
        />
      </div>
    );
  }

  // If viewing a single restaurant's complete detail page (Figma Images 2-5)
  if (activeDetailRestaurant) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <RestaurantDetailView
          restaurant={activeDetailRestaurant}
          initialTab={detailTab}
          onBack={() => {
            setActiveDetailRestaurant(null);
            setSelectedBranch?.('All Restaurants');
          }}
          onEdit={(r: RestaurantBranch) => setSelectedForEdit(r)}
          onSettings={(r: RestaurantBranch) => setActiveSettingsRestaurant(r)}
          onManageBranches={() => setActiveBranchesRestaurant(activeDetailRestaurant)}
        />

        {/* Edit Modal if triggered from detail view */}
        <EditRestaurantModal
          restaurant={selectedForEdit}
          isOpen={!!selectedForEdit}
          onClose={() => setSelectedForEdit(null)}
          onSave={handleRestaurantUpdated}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION (From Figma Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Restaurants
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your restaurants, locations, and assigned teams.
          </p>
        </div>

        {/* Top Right: + Create Restaurant Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-950 border border-zinc-700/90 hover:border-amber-400/60 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-amber-500/10 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create Restaurant</span>
        </button>
      </div>

      {/* 2. SUMMARY COUNTS BAR (From Figma Image 1: 3 Total  2 Open  1 Closed  3 Total Branches) */}
      <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm pb-5 border-b border-zinc-800/80 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-serif font-bold text-white">
            {totalCount}
          </span>
          <span className="text-zinc-400 font-medium">Total</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-serif font-bold text-white">
            {openCount}
          </span>
          <span className="text-zinc-400 font-medium">Open</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-serif font-bold text-white">
            {closedCount}
          </span>
          <span className="text-zinc-400 font-medium">Closed</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-serif font-bold text-white">
            {totalBranches}
          </span>
          <span className="text-zinc-400 font-medium">Total Branches</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants by name or city..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl shrink-0">
          {(['All', 'Open', 'Closed'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. RESTAURANTS GRID (From Figma Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onView={(r) => {
              setActiveDetailRestaurant(r);
              setDetailTab('overview');
              setSelectedBranch?.(r.name);
            }}
            onEdit={(r) => setSelectedForEdit(r)}
            onSettings={(r) => setActiveSettingsRestaurant(r)}
            onBranches={(r) => {
              setActiveBranchesRestaurant(r);
              setSelectedBranch?.(r.name);
            }}
          />
        ))}

        {/* 5. ADD RESTAURANT DASHED CARD (From Figma Image 1) */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
          className="border-2 border-dashed border-zinc-800 hover:border-amber-500/60 rounded-2xl p-8 min-h-[220px] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-zinc-900/40 cursor-pointer group shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-amber-500/20 border border-zinc-800 group-hover:border-amber-500/40 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">
            Add Restaurant
          </span>
        </div>
      </div>

      {/* 6. MODALS */}
      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRestaurantCreated}
      />

      <EditRestaurantModal
        restaurant={selectedForEdit}
        isOpen={!!selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        onSave={handleRestaurantUpdated}
      />
    </div>
  );
}
