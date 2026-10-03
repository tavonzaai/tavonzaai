'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  LayoutGrid,
  PlusCircle,
  Receipt,
  Monitor,
  ShoppingBag,
  CreditCard,
  ArrowLeftRight,
  Users,
  Award,
  FileText,
  Sparkles,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface CashierNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const cashierNavItems: CashierNavItem[] = [
  { name: 'Dashboard', href: '/cashier-dashboard/dashboard', icon: LayoutDashboard },
  { name: 'Table View', href: '/cashier-dashboard/table-view', icon: LayoutGrid },
  { name: 'POS', href: '/cashier-dashboard/pos', icon: Monitor },
  { name: 'Create Order', href: '/cashier-dashboard/create-order', icon: PlusCircle },
  { name: 'Bill Queue', href: '/cashier-dashboard/bill-queue', icon: Receipt, badge: '6', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { name: 'Orders', href: '/cashier-dashboard/orders', icon: ShoppingBag, badge: '3', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { name: 'Payments', href: '/cashier-dashboard/payments', icon: CreditCard },
  { name: 'Transactions', href: '/cashier-dashboard/transactions', icon: ArrowLeftRight },
  { name: 'Customers', href: '/cashier-dashboard/customers', icon: Users },
  { name: 'Loyalty', href: '/cashier-dashboard/loyalty', icon: Award },
  { name: 'Shift Report', href: '/cashier-dashboard/shift-report', icon: FileText },
  { name: 'AI Insights', href: '/cashier-dashboard/ai-insights', icon: Sparkles },
];

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const handleNavClick = (name: string) => {
    setActiveNav(name);
    setSidebarOpen(false);
  };

  const { handleLogout } = useLogout();

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-black border-r border-white/10 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.15)] font-['Inter'] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo / Brand Header */}
          <div className="h-20 px-6 border-b border-white/20 flex items-center justify-between">
            <Link
              href="/cashier-dashboard/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => handleNavClick('Dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                T
              </div>
              <div>
                <div className="text-white text-lg font-bold font-['Inter'] leading-tight tracking-tight">
                  Tavonza
                </div>
                <div className="text-white/30 text-xs font-normal font-['Inter'] uppercase leading-tight tracking-widest">
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

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
            {cashierNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav.toLowerCase() === item.name.toLowerCase();

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.name)}
                  className={`w-full h-10 px-3.5 rounded-lg inline-flex items-center justify-between gap-3 text-base font-normal font-['Inter'] leading-5 transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-zinc-800 text-white font-medium shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-6 h-6 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-neutral-400'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold font-['Inter'] ${
                        item.badgeColor || 'bg-white/10 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Links (Settings & Logout) */}
        <div className="p-3 border-t border-white/20 space-y-1 bg-black">
          <Link
            href="/cashier-dashboard/settings"
            onClick={() => handleNavClick('Settings')}
            className={`w-full h-10 px-3 py-2 rounded-[10px] inline-flex items-center gap-3 text-base font-normal font-['Inter'] leading-5 transition-colors cursor-pointer ${
              activeNav === 'Settings'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-10 px-3 py-2 rounded-[10px] inline-flex items-center gap-3 text-base font-normal font-['Inter'] leading-5 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
