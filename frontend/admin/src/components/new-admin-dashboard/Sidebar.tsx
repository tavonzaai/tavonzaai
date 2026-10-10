'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  ClipboardList,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { TavonzaLogoIcon } from '../TavonzaLogo';
import { useLogout } from '@/hooks/useLogout';
import { AdminNavTab } from './types';

interface SidebarProps {
  activeTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemConfig {
  id: AdminNavTab;
  label: string;
  icon: React.ElementType;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'restaurants', label: 'Restaurants', icon: Store },
  { id: 'branches', label: 'Branches', icon: ClipboardList },
  { id: 'permissions', label: 'Permissions', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'subscription', label: 'Subscription', icon: Shield },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const { handleLogout } = useLogout();

  const handleNavClick = (tabId: AdminNavTab) => {
    onSelectTab(tabId);
    router.push(`/new-admin-dashboard/${tabId}`, { scroll: false });
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity mobile-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: w-72 (288px) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black border-r border-neutral-800 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.15)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Top Brand Area */}
          <div className="px-6 py-4 border-b border-neutral-800/80 flex flex-col justify-center shrink-0">
            <span className="text-[11px] text-neutral-400 font-sans font-medium mb-1.5 tracking-tight">
              Admin Dashboard
            </span>
            <div className="flex items-center justify-between">
              <Link
                href="/new-admin-dashboard/dashboard"
                className="inline-flex items-center gap-3 group"
                onClick={() => {
                  onSelectTab('dashboard');
                  onClose();
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center p-1.5 shadow-sm group-hover:border-amber-400/50 transition-colors">
                  <TavonzaLogoIcon className="w-7 h-7" />
                </div>
                <div className="inline-flex flex-col justify-start items-start">
                  <span className="text-white text-base font-bold font-sans tracking-tight leading-4">
                    Tavonza
                  </span>
                  <span className="text-neutral-400 text-xs font-semibold font-sans uppercase leading-4 tracking-wider mt-0.5">
                    ADMIN
                  </span>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'restaurants' && activeTab === 'restaurant-branches');
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-3.5 py-3 rounded-xl inline-flex items-center justify-between text-left transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-zinc-900/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                      }`}
                    />
                    <span className="text-[15px] sm:text-base font-sans leading-tight">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* System Section Heading (Inline with nav, not pushed to bottom) */}
            <div className="pt-4 pb-1 px-3.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider font-sans">
              System
            </div>

            {/* Settings Nav Item */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full px-3.5 py-3 rounded-xl inline-flex items-center justify-between text-left transition-all ${
                activeTab === 'settings'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-zinc-900/60 font-medium'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Settings
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    activeTab === 'settings' ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                  }`}
                />
                <span className="text-[15px] sm:text-base font-sans leading-tight">
                  Settings
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom: Only Sign Out / Logout Button */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-3 rounded-xl flex items-center gap-3.5 text-neutral-300 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left font-sans text-[15px] sm:text-base font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
