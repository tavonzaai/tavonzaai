'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, User, Shield, LogOut, CheckCircle2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { logoutUser } from '@/redux/features/authApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function SuperAdminHeader({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || 'Alex Morgan';
  const displayRole = 'Super Admin';
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'AM';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'superadmin_logged_out=true; path=/; SameSite=Lax';
      }
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      router.push('/superadmin/login');
    } catch {
      router.push('/superadmin/login');
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/superadmin/tenants?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-56 right-0 h-20 px-4 sm:px-7 py-3 bg-black/90 shadow-[0px_0px_11px_0px_rgba(255,255,255,0.08)] border-b border-zinc-800 backdrop-blur-[10px] z-30 flex items-center justify-between">
      {/* Mobile Menu & Global Search matching Figma */}
      <div className="flex items-center gap-3 w-full max-w-lg">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar from Figma */}
        {/* <form onSubmit={handleGlobalSearch} className="w-full max-w-sm sm:max-w-md hidden sm:block">
          <div className="h-10 px-3 bg-stone-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center gap-2 transition focus-within:outline-zinc-600">
            <span className="text-neutral-400 text-sm font-normal font-inter select-none">⌕</span>
            <input
              type="text"
              placeholder="Search tenants, plans, invoices..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-zinc-600 font-inter focus:outline-none"
            />
          </div>
        </form> */}
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => toast.info('System notification center: All 128 tenants operating normally.')}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-black" />
          </button>
        </div>

        {/* User Profile Pill matching exact Figma: AM avatar, Alex Morgan, Super Admin, ⌄ */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="min-w-44 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800/90 rounded-lg flex items-center gap-2.5 transition border border-transparent hover:border-zinc-700/60 group"
          >
            {/* AM Avatar badge */}
            <div className="size-8 min-w-8 bg-amber-400 rounded-2xl flex justify-center items-center">
              <span className="text-zinc-800 text-xs font-semibold font-inter leading-4">
                {initials}
              </span>
            </div>

            {/* Names */}
            <div className="flex-1 flex flex-col items-start text-left leading-none gap-0.5">
              <span className="text-white text-xs font-medium font-poppins truncate max-w-[100px]">
                {displayName}
              </span>
              <span className="text-slate-500 text-[10px] font-normal font-inter">
                {displayRole}
              </span>
            </div>

            {/* Figma Chevron */}
            <span className={`text-white text-sm font-normal font-inter leading-5 transition-transform ${dropdownOpen ? 'rotate-180 text-yellow-400' : ''}`}>
              ⌄
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in font-inter">
              <div className="px-3.5 py-2.5 border-b border-zinc-800/80">
                <p className="text-xs font-medium text-white">{displayName}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'alex.morgan@tablepilot.io'}</p>
                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Shield className="w-3 h-3" />
                  Global Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/superadmin/profile');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-yellow-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/superadmin/settings');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Platform Settings</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    toast.success('Platform status: 100% operational.');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Platform Health Check</span>
                </button>
              </div>

              <div className="border-t border-zinc-800/80 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
