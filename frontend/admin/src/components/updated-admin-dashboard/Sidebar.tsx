'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Building2,
  X,
  Layers,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface OwnerNavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: string;
}

export const ownerNavItems: OwnerNavItem[] = [
  { id: 'restaurants', name: 'Restaurants', icon: Store, badge: '04' },
  { id: 'overview', name: 'Executive Overview', icon: LayoutDashboard },
  { id: 'orders', name: 'Live Orders', icon: ShoppingBag },
  { id: 'kitchen', name: 'Kitchen & Bar Sync', icon: ChefHat },
  { id: 'analytics', name: 'Finance & Growth', icon: BarChart3 },
  { id: 'staff', name: 'Teams & Staff', icon: Users },
];

interface OwnerSidebarProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function OwnerSidebar({
  activeNav,
  onSelectNav,
  isOpen,
  onClose,
}: OwnerSidebarProps) {
  const { handleLogout } = useLogout();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (w-72) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black border-r border-zinc-800 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.40)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="h-20 px-5 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
                <Store className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-white/30 text-[10px] uppercase font-normal tracking-tight font-['Inter']">
                  AI Hospitality
                </div>
                <div className="text-white text-base font-bold font-['Inter'] leading-4">
                  Tavonza Owner
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            {ownerNavItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectNav(item.id);
                    onClose();
                  }}
                  className={`w-full h-10 px-3 rounded-lg flex items-center justify-between transition-all group ${
                    isActive
                      ? 'bg-zinc-800 text-white font-medium shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />
                    <span className="text-sm font-['Inter']">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="h-5 px-2 bg-stone-900 text-amber-400 text-[10px] font-semibold rounded-full border border-amber-400/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu: Settings & Logout */}
        <div className="p-4 border-t border-white/25 space-y-1">
          <Link
            href="/admin-dashboard?tab=settings"
            className="w-full h-10 px-3 rounded-[20px] flex items-center gap-3 text-white/50 hover:text-white hover:bg-zinc-900/60 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-normal font-['Inter']">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full h-10 px-3 rounded-[20px] flex items-center gap-3 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-normal font-['Inter']">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
