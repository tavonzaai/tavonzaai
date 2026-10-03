'use client';

import React from 'react';
import {
  LayoutGrid,
  UtensilsCrossed,
  ClipboardList,
  Users,
  ChefHat,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { navToRoute } from './routes';

export interface BranchManagerNavItem {
  name: string;
  tabKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const managerNavItems: BranchManagerNavItem[] = [
  { name: 'Dashboard', tabKey: 'Dashboard', icon: LayoutGrid },
  { name: 'Table', tabKey: 'Table', icon: UtensilsCrossed },
  { name: 'Orders', tabKey: 'Orders', icon: ClipboardList, badge: '7', badgeColor: 'bg-amber-400/20 text-amber-400' },
  { name: 'Staff', tabKey: 'Staff', icon: Users, badge: '6', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Kitchen', tabKey: 'Kitchen', icon: ChefHat, badge: 'Live', badgeColor: 'bg-teal-500/20 text-teal-400' },
  { name: 'Payments', tabKey: 'Payments', icon: CreditCard, badge: '2', badgeColor: 'bg-orange-400/20 text-orange-400' },
  { name: 'Menu', tabKey: 'Menu', icon: BookOpen, badge: '5', badgeColor: 'bg-yellow-400/20 text-yellow-400' },
  { name: 'Reports', tabKey: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const handleNavClick = (tabKey: string) => {
    setActiveNav(tabKey);
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`w-72 shrink-0 min-h-screen bg-black border-r border-neutral-800 flex flex-col justify-between select-none z-50 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed lg:static inset-y-0 left-0 -translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-[3px] border-amber-400 flex items-center justify-center relative shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400" />
                <div className="absolute -top-0.5 right-1 w-1.5 h-1.5 bg-black rounded-full" />
              </div>

              <div className="flex flex-col">
                <span className="text-white text-base font-bold font-['Inter'] leading-tight tracking-wide">
                  Tavonza
                </span>
                <span className="text-white/40 text-[10px] font-medium font-['Inter'] uppercase tracking-widest">
                  Branch Manager
                </span>
              </div>
            </div>

            {setSidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-4 flex flex-col gap-1.5">
            {managerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav.toLowerCase() === item.tabKey.toLowerCase();

              return (
                <button
                  key={item.tabKey}
                  type="button"
                  onClick={() => handleNavClick(item.tabKey)}
                  className={`w-full px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-neutral-900 text-white font-medium shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-neutral-900/50 font-normal'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-['Inter'] leading-5">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium font-['Inter'] ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Section at Bottom */}
        <div className="p-4 border-t border-neutral-900/60 flex flex-col gap-2">
          <span className="px-3 text-neutral-500 text-xs font-semibold uppercase tracking-wider font-['Inter']">
            System
          </span>
          <button
            type="button"
            onClick={() => handleNavClick('Branch Config')}
            className={`w-full px-3.5 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer text-left ${
              activeNav.toLowerCase() === 'branch config'
                ? 'bg-neutral-900 text-white font-medium'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900/50 font-normal'
            }`}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${
                activeNav.toLowerCase() === 'branch config' ? 'text-white' : 'text-gray-400'
              }`}
            />
            <span className="text-sm font-['Inter'] leading-5">Branch Config</span>
          </button>
        </div>
      </aside>
    </>
  );
}
