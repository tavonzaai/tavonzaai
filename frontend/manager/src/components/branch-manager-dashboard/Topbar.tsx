'use client';

import React, { useState } from 'react';
import { Search, User, Menu, LogOut } from 'lucide-react';
import { mockManagerProfile } from './data';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../redux/features/authApi';

import { NotificationCenter } from '../common/NotificationCenter';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSidebar?: () => void;
}

export default function Topbar({
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}: TopbarProps) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const displayName = reduxUser?.name || mockManagerProfile.name;
  const displayRole = reduxUser?.role
    ? reduxUser.role.replace('_', ' ')
    : mockManagerProfile.role;

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowUserDropdown(false);
  };

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-neutral-800 bg-black flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
      {/* Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-3 w-full max-w-md">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Orders,staff,tabless......."
            className="w-full h-9 pl-10 pr-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 transition font-['Inter']"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Realtime Notification Center */}
        <NotificationCenter />

        {/* User Profile Pill matching Figma & connected to Redux Auth */}
        <div className="relative">
        <button
          type="button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800/80 rounded-lg shrink-0 transition cursor-pointer select-none text-left"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-semibold text-xs shadow-sm">
            <User className="w-4 h-4 text-neutral-950" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-white text-xs font-semibold font-['Poppins'] leading-tight">
              {displayName}
            </span>
            <span className="text-slate-400 text-[11px] font-medium font-['Poppins'] leading-tight capitalize">
              {displayRole}
            </span>
          </div>
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
            <div className="px-3 py-2 border-b border-neutral-800 flex flex-col">
              <span className="text-white text-xs font-semibold">{displayName}</span>
              <span className="text-neutral-500 text-[10px]">{reduxUser?.email || 'manager@tavonza.com'}</span>
            </div>
            <a
              href="/branch-manager-dashboard/profile"
              onClick={() => setShowUserDropdown(false)}
              className="w-full mt-1 px-3 py-2 text-left text-xs text-amber-400 hover:bg-neutral-800 rounded-lg flex items-center gap-2 transition cursor-pointer font-medium"
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile &amp; Settings</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-1 px-3 py-2 text-left text-xs text-red-400 hover:bg-neutral-800 rounded-lg flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
