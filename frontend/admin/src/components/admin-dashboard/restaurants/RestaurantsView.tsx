'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Store, Building2, Utensils, Filter } from 'lucide-react';
import { RestaurantBranch } from './types';
import { INITIAL_RESTAURANTS } from './restaurantsData';
import RestaurantCard from './components/RestaurantCard';
import CreateRestaurantModal from './components/CreateRestaurantModal';
import RestaurantDetailModal from './components/RestaurantDetailModal';
import EditRestaurantModal from './components/EditRestaurantModal';
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

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForView, setSelectedForView] = useState<RestaurantBranch | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<RestaurantBranch | null>(null);

  // Active restaurant for branches redirect page
  const [activeBranchRestaurant, setActiveBranchRestaurant] = useState<RestaurantBranch | null>(() => {
    if (initialBranchRestaurantId) {
      return INITIAL_RESTAURANTS.find((r) => r.id === initialBranchRestaurantId) || null;
    }
    return null;
  });

  // Client-side URL params resolution after initial mount to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const branchRestId = params.get('branchRestaurantId') || params.get('id');
      const restaurantName = params.get('restaurant');

      if (branchRestId) {
        const found = INITIAL_RESTAURANTS.find((r) => r.id === branchRestId);
        if (found) {
          setActiveBranchRestaurant(found);
          return;
        }
      }
      if (restaurantName) {
        const found = INITIAL_RESTAURANTS.find(
          (r) => r.name.toLowerCase() === restaurantName.toLowerCase()
        );
        if (found) {
          setActiveBranchRestaurant(found);
          return;
        }
      }
    }
  }, []);

  // Sync header with active restaurant name or branch parameter
  useEffect(() => {
    if (activeBranchRestaurant) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const branchParam = params.get('branch');
        if (branchParam) {
          setSelectedBranch?.(branchParam);
        } else {
          setSelectedBranch?.(activeBranchRestaurant.name);
        }
      } else {
        setSelectedBranch?.(activeBranchRestaurant.name);
      }
    }
  }, [activeBranchRestaurant, setSelectedBranch]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const branchRestId = params.get('branchRestaurantId') || params.get('id');
      const restaurantName = params.get('restaurant');
      const branchParam = params.get('branch');

      if (branchRestId) {
        const found = restaurants.find((r) => r.id === branchRestId);
        if (found) {
          setActiveBranchRestaurant(found);
          setSelectedBranch?.(branchParam || found.name);
          return;
        }
      }
      if (restaurantName) {
        const found = restaurants.find(
          (r) => r.name.toLowerCase() === restaurantName.toLowerCase()
        );
        if (found) {
          setActiveBranchRestaurant(found);
          setSelectedBranch?.(branchParam || found.name);
          return;
        }
      }
      setActiveBranchRestaurant(null);
      setSelectedBranch?.('Downtown Branch');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restaurants, setSelectedBranch]);

  // Open branches redirect (Called when user clicks "View" or "Branches" - redirects directly, no modal)
  const handleOpenBranches = (restaurant: RestaurantBranch) => {
    setActiveBranchRestaurant(restaurant);
    setSelectedBranch?.(restaurant.name);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'restaurants');
      url.searchParams.set('restaurant', restaurant.name);
      url.searchParams.set('id', restaurant.id);
      url.searchParams.set('branchRestaurantId', restaurant.id);
      url.searchParams.delete('branch');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Back to restaurants
  const handleBackToRestaurants = () => {
    setActiveBranchRestaurant(null);
    setSelectedBranch?.('Downtown Branch');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'restaurants');
      url.searchParams.delete('restaurant');
      url.searchParams.delete('id');
      url.searchParams.delete('branchRestaurantId');
      url.searchParams.delete('branch');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesStatus =
      statusFilter === 'All' || restaurant.status === statusFilter;
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.manager?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle new restaurant added
  const handleRestaurantCreated = (newRestaurant: RestaurantBranch) => {
    setRestaurants((prev) => [newRestaurant, ...prev]);
  };

  // Handle updated restaurant
  const handleRestaurantUpdated = (updated: RestaurantBranch) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  // If user clicked View or Branches, render the Branches View matching Figma snippet directly!
  if (activeBranchRestaurant) {
    return (
      <BranchesView
        restaurant={activeBranchRestaurant}
        onBack={handleBackToRestaurants}
        onGoToRestaurants={handleBackToRestaurants}
        setSelectedBranch={setSelectedBranch}
        selectedBranch={selectedBranch}
      />
    );
  }

  const isAnyModalOpen = isCreateModalOpen || !!selectedForEdit || !!selectedForView;

  return (
    <>
      <div
        className={`w-full space-y-6 animate-in fade-in duration-200 pb-16 transition-all duration-300 ${
          isAnyModalOpen ? 'filter blur-[3px] pointer-events-none select-none opacity-80' : ''
        }`}
      >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matches Figma Layout) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-semibold font-sans tracking-tight leading-9">
            Restaurants
          </h1>
          <p className="text-zinc-500 text-base font-normal mt-1 leading-6">
            Manage your restaurants, locations, and assigned teams.
          </p>
        </div>

        {/* Create Restaurant Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(255,214,168,0.60)] flex items-center gap-1.5 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-semibold leading-5">Create Restaurant</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & STATUS FILTER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-zinc-800/80">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, city, manager..."
            className="w-full h-9 pl-9 pr-4 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Open', 'Closed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === status
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {status}
              {status === 'All' && ` (${restaurants.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RESTAURANTS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onView={(r) => handleOpenBranches(r)}
            onEdit={(r) => setSelectedForEdit(r)}
            onBranches={(r) => handleOpenBranches(r)}
          />
        ))}

        {/* Add Restaurant Card (from Figma Mockup) */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full min-h-[160px] bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-stone-600/70 hover:border-amber-400/70 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-12 h-12 bg-stone-200 group-hover:bg-amber-400 rounded-full flex items-center justify-center text-stone-800 group-hover:text-white transition-colors shadow-sm">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-stone-300 group-hover:text-white text-sm font-medium transition-colors">
            Add Restaurant
          </div>
        </button>
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && (
        <div className="p-12 text-center bg-neutral-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
          <Store className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="text-white text-base font-semibold">No restaurants found</div>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Try modifying your search keywords or clear your status filters to see existing restaurants.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (Rendered outside blurred page content) */}
      {/* ========================================================================= */}
      {/* Create Restaurant Multi-Step Modal */}
      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRestaurantCreated}
      />

      {/* Restaurant View Detail Modal */}
      <RestaurantDetailModal
        restaurant={selectedForView}
        isOpen={!!selectedForView}
        onClose={() => setSelectedForView(null)}
        onEdit={(r) => {
          setSelectedForView(null);
          setSelectedForEdit(r);
        }}
      />

      {/* Edit Restaurant Modal */}
      <EditRestaurantModal
        restaurant={selectedForEdit}
        isOpen={!!selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        onSave={handleRestaurantUpdated}
      />
    </>
  );
}
