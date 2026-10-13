'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Menu, Sparkles, User, LogOut } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useLogout } from '@/hooks/useLogout';
import { NotificationCenter } from '../../common/NotificationCenter';

interface KitchenHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenAIModal: () => void;
}

export default function KitchenHeader({
  searchQuery,
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
  onOpenAIModal,
}: KitchenHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [branchOpen, setBranchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.assignments?.[0]?.branch?.name || 'Downtown Branch');

  const displayName = user?.name || user?.email?.split('@')[0] || 'Chef Michael';
  const displayRole = user?.assignments?.[0]?.role?.replace(/_/g, ' ') || 'Kitchen Operation';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n?.[0]?.toUpperCase() || "")
    .join('') || 'KM';

  return (
    <header className="h-20 bg-black border-b border-white/10 shadow-[0px_0px_10px_0px_rgba(255,255,255,0.08)] px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Mobile Toggle & Branch Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector Pill */}
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setBranchOpen(!branchOpen)}
            className="h-9 px-2.5 sm:px-3 py-1.5 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-white/20 flex items-center flex-nowrap gap-1.5 sm:gap-2 cursor-pointer transition-all max-w-[155px] xs:max-w-[210px] sm:max-w-none shrink-0 min-w-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-sm font-medium text-slate-400 font-['Inter'] hidden md:inline shrink-0">Tavonza Group /</span>
            <span className="text-xs sm:text-sm md:text-base font-medium text-white font-['Inter'] truncate whitespace-nowrap min-w-0">{selectedBranch}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {branchOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1 z-50">
              {['Downtown Branch', 'Uptown Bistro', 'Lumina Rooftop'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBranch(b);
                    setBranchOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, tickets, stations, or ask AI..."
            className="w-full h-9 pl-10 pr-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 focus:outline-amber-500/50 text-sm text-zinc-200 placeholder:text-neutral-500 transition-all font-['Inter']"
          />
        </div>
      </div>

      {/* Right: Notification & Chef Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Ask AI Quick Trigger */}
        <button
          type="button"
          onClick={onOpenAIModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Ask AI</span>
        </button>

        {/* Notification Bell */}
        <NotificationCenter />

        {/* Staff Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="h-10 sm:h-12 bg-zinc-900 rounded-lg px-2 sm:px-2.5 flex items-center gap-2 sm:gap-3 border border-white/10 hover:border-white/20 cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-200 font-['Plus_Jakarta_Sans'] leading-tight">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 font-medium font-['Inter'] leading-tight capitalize">
                {displayRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-zinc-400">{user?.email || selectedBranch}</p>
                <p className="text-xs text-amber-400 mt-0.5 capitalize">{displayRole}</p>
              </div>
              <div className="border-t border-white/5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
