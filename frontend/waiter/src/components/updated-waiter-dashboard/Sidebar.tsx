'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  ClipboardList,
  BellRing,
  Bot,
  User,
  Settings,
  LogOut,
  Sparkles,
  X,
  Clock,
  Layers,
  Receipt,
  LayoutDashboard,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const navItems: NavItem[] = [
  { id: 'floor-view', name: 'Floor View', icon: LayoutGrid },
  { id: 'orders', name: 'Orders', icon: ClipboardList, badge: '04' },
  { id: 'order-status', name: 'Order Status', icon: Clock, badge: '14' },
  { id: 'order-requests', name: 'Order Requests', icon: Layers, badge: '14' },
  { id: 'alerts', name: 'Alerts', icon: BellRing, badge: '14' },
  { id: 'checkout', name: 'Bill Checkout', icon: Receipt, badge: '02' },
  { id: 'jarvis', name: 'JARVIS', icon: Bot, badge: '14' },
  { id: 'profile', name: 'Profile', icon: User },
];

interface SidebarProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeNav,
  onSelectNav,
  isOpen,
  onClose,
}: SidebarProps) {
  const { handleLogout } = useLogout();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden mobile-sidebar-backdrop transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (w-72 / 18rem) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black border-r border-zinc-800/80 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.20)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand Logo */}
        <div>
          <div className="h-20 px-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase font-semibold tracking-wider font-['Inter']">
                  AI Hospitality
                </div>
                <div className="text-white text-base font-bold tracking-tight font-['Inter']">
                  Tavonza
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
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
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />
                    <span className="text-sm font-['Inter']">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="h-6 px-2 min-w-6 bg-stone-900 text-amber-500 text-[10px] font-semibold rounded-full flex items-center justify-center border border-amber-500/20 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu: Switch Mode, Settings & Logout */}
        <div className="p-4 border-t border-zinc-800/80 space-y-1">
          <Link
            href="/waiter-dashboard/dashboard"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span className="font-['Inter']">Classic Station View</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase">
              Full Hub
            </span>
          </Link>
          <Link
            href="/waiter-dashboard?tab=settings"
            className="w-full h-10 px-3 rounded-lg flex items-center gap-3 text-white/50 hover:text-white hover:bg-zinc-900/60 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-normal font-['Inter']">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full h-10 px-3 rounded-lg flex items-center gap-3 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-normal font-['Inter']">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
