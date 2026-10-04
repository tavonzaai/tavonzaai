'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  QrCode,
  UtensilsCrossed,
  UserCheck,
  Bell,
  Bot,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface WaiterSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const waiterNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'My Tables', icon: Layers, badge: '04', badgeColor: 'text-amber-500 bg-stone-900' },
  { name: 'Orders', icon: ShoppingBag, badge: '14', badgeColor: 'text-amber-500 bg-stone-900' },
  { name: 'QR Orders', icon: QrCode, badge: '14', badgeColor: 'text-amber-500 bg-stone-900' },
  { name: 'Menu', icon: UtensilsCrossed },
  { name: 'Guest Requests', icon: UserCheck, badge: '05', badgeColor: 'text-amber-500 bg-stone-900' },
  { name: 'Notifications', icon: Bell, badge: '14', badgeColor: 'text-amber-500 bg-stone-900' },
  { name: 'AI Assistant', icon: Bot, isPro: true },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: WaiterSidebarProps) {
  const { handleLogout } = useLogout();
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-black border-r border-white/10 shadow-[0px_0px_11px_0px_rgba(255,255,255,0.15)] flex flex-col md:sticky md:top-0 md:translate-x-0 flex-shrink-0 select-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 px-5 border-b border-white/15 flex items-center justify-between flex-shrink-0 bg-black">
          <Link href="/" title="Back to Landing Page" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 shadow-inner group-hover:border-emerald-500/50 transition-colors">
              <img
                src="/assets/costomerpages/customer-page-icon.svg"
                alt="Tavonza Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.png';
                }}
              />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 leading-snug font-['Inter'] group-hover:text-emerald-400 transition-colors">
                Tavonza
               </div>
              <div className="text-xs font-normal text-white/40 uppercase tracking-widest leading-tight font-['Inter']">
                AI Hospitality
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          {waiterNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-md border border-white/10 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-zinc-400'
                    }`}
                  />
                  <span className="truncate font-['Inter']">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium font-['Inter'] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isPro && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
                      PRO
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/15 space-y-1 bg-black flex-shrink-0">
          <Link
            href="/updated-waiter-dashboard/floor-view"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-['Inter']">Touch Floor Station</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
              Touch POS
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveNav('Settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors cursor-pointer ${
              activeNav === 'Settings'
                ? 'bg-zinc-800 text-white font-semibold border border-white/10'
                : 'text-white/60 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Settings className="w-4 h-4 text-white/50" />
            <span className="font-['Inter']">Settings</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-['Inter']">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
