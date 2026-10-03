'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Flame,
  BookOpen,
  Package,
  FileSpreadsheet,
  Sparkles,
  Settings,
  LogOut,
  X,
  Layers,
  Clock,
  Bot
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface KitchenSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const kitchenNavItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Kitchen Queue', icon: Clock, badge: '24', badgeColor: 'text-amber-400 bg-amber-500/10' },
  { name: 'Active Orders', icon: UtensilsCrossed, badge: '6', badgeColor: 'text-red-400 bg-red-500/10' },
  { name: 'Stations', icon: Flame },
  { name: 'Recipes', icon: BookOpen },
  { name: 'Inventory', icon: Package, badge: '1 Low', badgeColor: 'text-rose-400 bg-rose-500/10' },
  { name: 'Shift Report', icon: FileSpreadsheet },
  { name: 'Future AI', icon: Bot, badge: 'Roadmap', badgeColor: 'text-orange-400 bg-orange-500/10' },
  { name: 'AI Insights', icon: Sparkles, isPro: true },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: KitchenSidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-72 h-screen bg-black border-r border-white/15 shadow-[0px_0px_11px_0px_rgba(255,255,255,0.15)] flex flex-col md:sticky md:top-0 md:translate-x-0 flex-shrink-0 select-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 px-5 border-b border-white/15 flex items-center justify-between flex-shrink-0 bg-black">
          <Link href="/" title="Back to Landing Page" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 shadow-inner group-hover:border-amber-500/50 transition-colors">
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
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 leading-snug font-['Inter'] group-hover:text-amber-400 transition-colors">
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
          {kitchenNavItems.map((item) => {
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium font-['Inter'] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isPro && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
                      AI
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/15 space-y-1 bg-black flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveNav('Settings');
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
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
