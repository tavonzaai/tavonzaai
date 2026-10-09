'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  Search,
  Activity,
  Coffee,
  ChefHat,
} from 'lucide-react';
import { MOCK_BRANCHES, MOCK_RESTAURANTS } from '../data';
import { BranchItem, RestaurantItem } from '../types';
import RestaurantBranchesDetailView from './RestaurantBranchesDetailView';

export default function BranchesView() {
  const [branches, setBranches] = useState<BranchItem[]>(MOCK_BRANCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  const filtered = branches.filter((b) => {
    return (
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (selectedRestaurant) {
    return (
      <RestaurantBranchesDetailView
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold font-sans">
            Branches & Dining Rooms
          </h1>
          <p className="text-neutral-400 text-sm font-sans mt-0.5">
            Monitor real-time table occupancy, kitchen sync links, and managers across all locations.
          </p>
        </div>

        <button
          onClick={() => setSelectedRestaurant(MOCK_RESTAURANTS[0])}
          className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg inline-flex items-center gap-2 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
        >
          <Plus className="size-4 stroke-[3]" />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Quick Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Active Locations</span>
          <span className="text-2xl font-semibold text-white font-sans">4</span>
          <span className="text-[10px] text-green-500 font-sans">Across 3 brands</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Total Dining Tables</span>
          <span className="text-2xl font-semibold text-white font-sans">70</span>
          <span className="text-[10px] text-neutral-400 font-sans">Realtime synced</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">Average Occupancy</span>
          <span className="text-2xl font-semibold text-amber-400 font-sans">71.5%</span>
          <span className="text-[10px] text-green-500 font-sans">+4.2% peak hours</span>
        </div>
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20 flex flex-col gap-1">
          <span className="text-xs text-neutral-400 font-sans">KDS & Bar Gateway</span>
          <span className="text-2xl font-semibold text-green-400 font-sans">100%</span>
          <span className="text-[10px] text-green-500 font-sans">All nodes online</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-gray-300/20">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search branches, restaurants, or managers..."
            className="w-full h-10 pl-9 pr-4 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 font-sans"
          />
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((branch) => (
          <div
            key={branch.id}
            className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-between gap-5 hover:border-amber-400/40 transition-all shadow-xl group"
          >
            <div>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                    <GitBranch className="size-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-white text-base font-semibold font-sans leading-5 group-hover:text-amber-400 transition-colors">
                      {branch.name}
                    </h2>
                    <span className="text-xs text-amber-300 font-sans font-medium">
                      {branch.restaurantName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {branch.status}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-sans mt-3">
                <MapPin className="size-3.5 text-neutral-500" />
                <span>{branch.location}</span>
              </div>
            </div>

            {/* Occupancy and Stats */}
            <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-lg border border-neutral-800/60">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-neutral-400">Live Dining Occupancy</span>
                <span className="text-amber-400 font-semibold">{branch.occupancy}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  style={{ width: `${branch.occupancy}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block">Tables</span>
                  <span className="text-white font-medium">{branch.tablesCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">General Manager</span>
                  <span className="text-neutral-300 font-medium truncate block max-w-[110px]">
                    {branch.manager}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">KDS Link</span>
                  <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    {branch.kitchenSync}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-400 font-sans">
                Revenue: <strong className="text-green-400">{branch.monthlyRevenue}</strong>/mo
              </span>

              <button
                onClick={() => {
                  const targetRest =
                    MOCK_RESTAURANTS.find((r) => r.id === branch.restaurantId || r.name === branch.restaurantName) ||
                    MOCK_RESTAURANTS[0];
                  setSelectedRestaurant(targetRest);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              >
                Manage Floor &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
