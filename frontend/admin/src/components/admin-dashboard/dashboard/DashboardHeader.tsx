'use client';

import React, { useRef, useEffect } from 'react';
import {
  Menu as MenuIcon,
  ChevronDown,
  Search,
  Bell,
  User,
} from 'lucide-react';
import { useAppSelector } from '@/redux/store';

export interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  branchDropdownOpen: boolean;
  setBranchDropdownOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  onOpenSettings?: () => void;
}

export default function DashboardHeader({
  setSidebarOpen,
  selectedBranch,
  setSelectedBranch,
  branchDropdownOpen,
  setBranchDropdownOpen,
  searchQuery,
  setSearchQuery,
  showNotifications,
  setShowNotifications,
  onOpenSettings,
}: DashboardHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.name || 'Owner / Administrator';
  const displayEmail = user?.email || 'owner@tavonza.demo';

  const defaultBranches = [
    'Downtown Branch',
    'Tavonza Downtown',
    'Tavonza Uttara',
    'Tavonza Banani',
    'Tavonza Mirpur',
    'Waterfront Plaza',
    'Uptown Bistro',
    'Airport Express',
  ];
  const branches = Array.from(new Set([selectedBranch, ...defaultBranches])).filter(Boolean);

  const branchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setBranchDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setBranchDropdownOpen(false);
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setBranchDropdownOpen, setShowNotifications]);

  return (
    <header className="sticky top-0 z-50 h-20 bg-black border-b border-zinc-800/80 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.25)]">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 sm:p-2 -ml-1 text-zinc-400 hover:text-white rounded-lg md:hidden cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Branch Selector */}
        <div ref={branchRef} className="relative min-w-0">
          <button
            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="h-9 px-2.5 sm:px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center flex-nowrap gap-1.5 sm:gap-2 transition-colors cursor-pointer max-w-[155px] xs:max-w-[210px] sm:max-w-none shrink-0 min-w-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-70 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-400 hidden md:inline shrink-0">
              Tavonza Group /
            </span>
            <span className="text-xs sm:text-sm md:text-base font-medium text-white truncate whitespace-nowrap min-w-0">
              {selectedBranch}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 shrink-0" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              {branches.map((branch) => (
                <button
                  key={branch}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setBranchDropdownOpen(false);
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.set('branch', branch);
                      window.history.pushState({}, '', url.toString());
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    selectedBranch === branch
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {branch}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, customers, or ask AI..."
            className="w-full h-9 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-base font-normal text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-zinc-700 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Header Controls: Integrated Profile & Notifications Card */}
      <div ref={notificationsRef} className="relative shrink-0">
        <div className="h-10 sm:h-12 bg-zinc-900 border border-zinc-800/90 rounded-lg flex items-center px-2 sm:px-3 gap-1.5 sm:gap-3 shadow-sm shrink-0">
          {/* Notification Bell Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-sm">
              2
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="h-5 sm:h-7 w-px bg-zinc-700/60 flex-shrink-0" />

          {/* User Profile */}
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
            title="Open Account Settings"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 flex items-center justify-center text-white flex-shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-white leading-4 truncate max-w-[150px]">{displayName}</div>
              <div className="text-xs text-zinc-400 leading-4 truncate max-w-[150px]">{displayEmail}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/80 ml-0.5 hidden md:block" />
          </div>
        </div>

        {/* Notifications Dropdown Modal */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <span className="text-xs text-amber-400 font-medium cursor-pointer">
                Mark all read
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-rose-400">Inventory Alert</span>
                <span className="text-xs text-zinc-500">5m ago</span>
              </div>
              <p className="text-xs text-zinc-300">
                Mozzarella cheese is below 20% minimum threshold.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-400">Revenue Peak</span>
                <span className="text-xs text-zinc-500">18m ago</span>
              </div>
              <p className="text-xs text-zinc-300">
                Lunch revenue exceeded target by +18.4%.
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

