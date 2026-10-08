'use client';

import React, { useState } from 'react';
import {
  Search,
  Mic,
  Bell,
  Sparkles,
  ChevronDown,
  Menu,
  CheckCircle2,
  X,
} from 'lucide-react';
import SmartRemindersPopover from './SmartRemindersPopover';
import { useAppSelector } from '@/redux/hooks';
import { useLogout } from '@/hooks/useLogout';

export interface WaiterHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenVoiceModal?: () => void;
  onOpenAIModal?: () => void;
}

export default function WaiterHeader({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  onOpenVoiceModal,
  onOpenAIModal,
}: WaiterHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(user?.assignments?.[0]?.branch?.name || 'Downtown Branch');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [remindersCount, setRemindersCount] = useState(4);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Staff Waiter';
  const displayRole = user?.assignments?.[0]?.role?.replace(/_/g, ' ') || 'Waiter';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('') || 'W';

  const branches = ['Downtown Branch', 'Uptown Bistro', 'Seaside Terrace', 'Airport Lounge'];

  return (
    <header className="sticky top-0 z-50 h-20 bg-black/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-[0px_0px_6px_0px_rgba(255,255,255,0.15)] flex-shrink-0">
      {/* Left: Mobile Toggle & Location Pill */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1.5 sm:p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Selector */}
        <div className="relative min-w-0">
          <button
            type="button"
            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="h-9 px-2.5 sm:px-3 py-1.5 bg-zinc-900 rounded-lg outline outline-1 outline-white/10 hover:outline-white/20 inline-flex items-center flex-nowrap gap-1.5 sm:gap-2 transition-all cursor-pointer max-w-[155px] xs:max-w-[210px] sm:max-w-none shrink-0 min-w-0"
          >
            <div className="w-2 h-2 relative opacity-90 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <div className="text-slate-400 text-sm font-medium font-['Inter'] hidden md:inline shrink-0">
              Tavonza Group /
            </div>
            <div className="text-white text-xs sm:text-sm md:text-base font-medium font-['Inter'] truncate whitespace-nowrap min-w-0">
              {selectedBranch}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 top-11 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-xs font-semibold text-zinc-500 uppercase px-2.5 py-1 tracking-wider">
                Select Branch
              </div>
              {branches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBranch(b);
                    setBranchDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer transition-colors ${
                    selectedBranch === b
                      ? 'bg-amber-500/15 text-amber-400 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{b}</span>
                  {selectedBranch === b && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables, orders, guests…"
            className="w-full h-9 pl-10 pr-4 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm font-normal text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/40 transition-all font-['DM_Sans']"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Voice, Alerts, Bell, and Waiter Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Voice AI Button */}
        <button
          type="button"
          onClick={onOpenVoiceModal || onOpenAIModal}
          className="h-8 sm:h-9 pl-2 sm:pl-3 pr-2.5 sm:pr-3.5 py-1 rounded-lg outline outline-1 outline-amber-500/40 hover:outline-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs sm:text-sm font-medium font-['DM_Sans'] inline-flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/10 shrink-0"
        >
          <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden xs:inline">Voice</span>
        </button>

        {/* Smart Reminders Icon with Purple Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={`Smart Reminders (${remindersCount})`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            {remindersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-[10px] font-bold font-['DM_Sans'] flex items-center justify-center">
                {remindersCount}
              </span>
            )}
          </button>

          <SmartRemindersPopover
            isOpen={alertsOpen}
            onClose={() => setAlertsOpen(false)}
            onCountChange={(cnt) => setRemindersCount(cnt)}
          />
        </div>

        {/* Notifications Icon with Red Badge (2) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Notifications (2)"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs font-bold font-['Inter'] flex items-center justify-center">
              2
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-sm font-bold text-white">Shift Notifications</span>
                <span className="text-xs text-amber-400 font-semibold">2 New</span>
              </div>
              <div className="space-y-2 mt-2 text-sm">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-200">
                  <div className="font-semibold text-white">VIP Table Seated</div>
                  <div className="text-zinc-400 text-xs">Mr. Henderson seated at Table 03.</div>
                </div>
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-200">
                  <div className="font-semibold text-white">Shift Notice</div>
                  <div className="text-zinc-400 text-xs">Break rotation starts in 45 minutes.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Waiter Profile Pill */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="h-10 sm:h-11 px-2 sm:px-2.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded-xl flex items-center gap-2 hover:border-zinc-500 transition-all cursor-pointer shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shrink-0">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-slate-200 font-['Plus_Jakarta_Sans'] leading-tight">
                {displayName}
              </div>
              <div className="text-xs font-medium font-['Inter'] leading-tight">
                <span className="text-slate-400 capitalize">{displayRole}</span>
                <span className="text-emerald-500 mx-1">·</span>
                <span className="text-emerald-400">Shift Active</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-13 w-56 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-zinc-800">
                <div className="text-sm font-bold text-white">{displayName}</div>
                <div className="text-xs text-zinc-400">{user?.email || selectedBranch}</div>
                <div className="text-xs text-emerald-400 mt-0.5">Role: {displayRole}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  alert('Shift relief requested. Manager notified.');
                }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg mt-1"
              >
                Request Shift Relief / Break
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
              >
                End Shift & Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
