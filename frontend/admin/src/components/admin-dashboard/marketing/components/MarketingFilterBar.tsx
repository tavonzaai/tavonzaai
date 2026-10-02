'use client';

import React from 'react';
import { Search, Filter, MessageSquare, Mail, Bell } from 'lucide-react';
import { CampaignChannel } from '../types';

interface MarketingFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedChannel: CampaignChannel | 'All';
  setSelectedChannel: (c: CampaignChannel | 'All') => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  totalCount: number;
  filteredCount: number;
}

export default function MarketingFilterBar({
  searchQuery,
  setSearchQuery,
  selectedChannel,
  setSelectedChannel,
  selectedStatus,
  setSelectedStatus,
  totalCount,
  filteredCount,
}: MarketingFilterBarProps) {
  const channels: { label: string; value: CampaignChannel | 'All'; icon?: React.ElementType }[] = [
    { label: 'All Channels', value: 'All' },
    { label: 'SMS', value: 'SMS', icon: MessageSquare },
    { label: 'Email', value: 'Email', icon: Mail },
    { label: 'Push', value: 'Push', icon: Bell },
  ];

  const statuses = ['All Statuses', 'Active', 'Draft', 'Scheduled', 'Completed'];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full bg-neutral-900/60 p-3 rounded-xl border border-white/5 backdrop-blur-md">
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns by name, audience, or message..."
          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Center & Right: Channel Filters & Status Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Channel Pills */}
        <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.value;
            return (
              <button
                key={ch.value}
                onClick={() => setSelectedChannel(ch.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Dropdown / Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-black/40 border border-white/10 text-zinc-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-amber-500/60 cursor-pointer font-medium"
          >
            {statuses.map((st) => (
              <option key={st} value={st} className="bg-zinc-900 text-white">
                {st}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Count Indicator */}
        <div className="hidden sm:block text-xs text-zinc-500 pl-1 font-medium">
          Showing <span className="text-white font-semibold">{filteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
}
