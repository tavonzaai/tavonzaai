'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  Sparkles,
  User,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLogout } from '@/hooks/useLogout';
import { getCashierProfile } from '@/lib/auth';
import { useAppSelector } from '@/redux/store';

interface CashierHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenAIModal?: () => void;
}

export default function CashierHeader({
  searchQuery,
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
  onOpenAIModal,
}: CashierHeaderProps) {
  const reduxAuth = useAppSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState(getCashierProfile());
  const { handleLogout } = useLogout();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setLocalUser(getCashierProfile());
  }, []);

  const activeUser = reduxAuth.user || localUser;
  const displayName = activeUser?.name || 'Nobin Mille';
  const displayRole = (activeUser as any)?.assignments?.[0]?.role?.replace(/_/g, ' ') || activeUser?.role || 'Cashier';
  const branchName = (activeUser as any)?.assignments?.[0]?.branch?.name || (activeUser as any)?.station || 'Downtown Branch';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase() || '')
    .join('') || 'NM';

  return (
    <header className="h-20 bg-black border-b border-white/10 px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 flex-shrink-0 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.25)] font-['Inter']">
      {/* Left: Mobile Toggle & Branch Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1.5 sm:p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector Pill */}
        <div className="h-9 px-2.5 sm:px-3 py-1.5 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 inline-flex items-center flex-nowrap gap-1.5 sm:gap-2 max-w-[155px] xs:max-w-[210px] sm:max-w-none shrink-0 min-w-0">
          <span className="size-2 rounded-full bg-green-500 opacity-80 animate-pulse shrink-0" />
          <span className="text-slate-400 text-sm font-medium font-['Inter'] leading-4 hidden md:inline shrink-0">
            Tavonza Group /
          </span>
          <span className="text-white text-xs sm:text-sm md:text-base font-medium font-['Inter'] truncate whitespace-nowrap min-w-0">
            Downtown Branch
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 shrink-0" />
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, customers, or ask AI..."
            className="w-full h-9 pl-9 pr-4 bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-white/10 text-base text-white placeholder:text-neutral-500 focus:outline-amber-500/50 transition-colors font-['Inter']"
          />
        </div>
      </div>

      {/* Right: Notifications & Emily Wilson Cashier Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="size-9 sm:size-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center relative text-zinc-300 hover:text-white hover:border-amber-500/30 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="size-4 bg-red-500 rounded-full text-white text-xs font-bold absolute -top-1 -right-1 flex items-center justify-center shadow-md font-['Inter']">
              2
            </span>
          </button>

          {/* Notification Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 font-['Inter']">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm font-semibold text-white font-['Inter']">Checkout Alerts</span>
                <span className="text-xs text-amber-400 font-medium font-['Inter']">2 Actions Required</span>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-300 font-['Inter']">
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  Card transaction TX-10579 requires manual verification.
                </div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  Three completed orders are awaiting payment at Table 12.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cashier Profile Badge (Emily Wilson) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="h-10 sm:h-12 px-2 sm:px-3 bg-zinc-900 rounded-[5px] border border-white/10 flex items-center gap-2 sm:gap-3 hover:border-amber-500/30 transition-colors cursor-pointer"
          >
            {/* Avatar with amber ring */}
            <div className="size-7 sm:size-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm font-['Inter']">{initials}</span>
            </div>

            <div className="text-left hidden sm:block border-l border-white/10 pl-3">
              <div className="text-slate-200 text-sm md:text-base font-medium font-['Inter'] leading-4">
                {displayName}
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium font-['Inter'] leading-4 capitalize">
                {displayRole}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-white ml-0.5 sm:ml-1 shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 font-['Inter']">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-semibold text-white font-['Inter']">{displayName}</p>
                <p className="text-xs text-zinc-400 font-['Inter'] capitalize">{displayRole} · {branchName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast.info('Viewing Cashier Profile');
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer font-['Inter']"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profile Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAIModal) onOpenAIModal();
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer font-['Inter']"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ask Tavonza AI
              </button>
              <div className="border-t border-white/5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer font-['Inter']"
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
