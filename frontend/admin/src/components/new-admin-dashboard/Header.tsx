'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, User as UserIcon, LogOut, Settings, ChevronDown, Bell } from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import { useLogout } from '@/hooks/useLogout';
import { AdminNavTab } from './types';

interface HeaderProps {
  onOpenSidebar: () => void;
  onSelectTab: (tab: AdminNavTab) => void;
}

export default function Header({ onOpenSidebar, onSelectTab }: HeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || 'Robert Geo';
  const displayRole = user?.role ? (user.role.includes('ADMIN') ? 'Admin' : user.role) : 'Admin';

  return (
    <header className="h-[73px] px-6 lg:px-8 border-b border-neutral-800 bg-black/95 backdrop-blur-md shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.15)] sticky top-0 z-30 flex items-center justify-between shrink-0">
      {/* Left Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          aria-label="Open navigation sidebar"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-neutral-400 font-sans">
            Tavonza Neural Gateway • Live
          </span>
        </div>
      </div>

      {/* Right User Badge */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-48 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800/90 border border-neutral-800/80 rounded-lg inline-flex justify-between items-center transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {/* Amber Circle Avatar */}
              <div className="size-9 bg-amber-400 rounded-full flex justify-center items-center shrink-0 shadow-sm shadow-amber-500/20">
                <UserIcon className="size-4 text-black stroke-[2.5]" />
              </div>

              {/* User Details */}
              <div className="inline-flex flex-col justify-start items-start text-left">
                <span className="text-white text-sm font-medium font-sans leading-4 truncate max-w-[95px]">
                  {displayName}
                </span>
                <span className="text-slate-400 text-xs font-medium font-sans leading-4">
                  {displayRole}
                </span>
              </div>
            </div>

            <ChevronDown className="size-4 text-neutral-400 group-hover:text-white transition-transform" />
          </button>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-2 border-b border-neutral-800/60 mb-1">
                <p className="text-xs text-neutral-400 font-sans">Signed in as</p>
                <p className="text-sm font-medium text-white font-sans truncate">
                  {user?.email || 'robert.geo@tavonza.ai'}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectTab('settings');
                  setDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg flex items-center gap-2.5 transition-colors text-left"
              >
                <Settings className="size-4 text-neutral-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-colors text-left mt-1"
              >
                <LogOut className="size-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
