'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Wine,
  Package,
  BookOpen,
  Truck,
  Wallet,
  TrendingUp,
  BarChart3,
  LineChart,
  Users,
  UserCheck,
  HeartHandshake,
  Megaphone,
  Star,
  FileText,
  Bot,
  Store,
  Bell,
  Building2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

export interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Orders', icon: ShoppingBag },
  { name: 'POS', icon: CreditCard },
  { name: 'QR Ordering', icon: QrCode },
  { name: 'Menu', icon: UtensilsCrossed },
  { name: 'Tables', icon: Layers },
  { name: 'Kitchen Display', icon: ChefHat },
  { name: 'Bar Display', icon: Wine },
  { name: 'Inventory', icon: Package },
  { name: 'Recipes', icon: BookOpen },
  { name: 'Suppliers', icon: Truck },
  { name: 'Payments', icon: Wallet },
  { name: 'Finance', icon: BarChart3 },
  { name: 'Analytics', icon: LineChart },
  { name: 'Business Intelligence', icon: TrendingUp },
  { name: 'Employees', icon: Users },
  { name: 'Customers', icon: UserCheck },
  { name: 'Restaurants', icon: Building2 },
  { name: 'Loyalty', icon: HeartHandshake },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Reviews', icon: Star },
  { name: 'Documents', icon: FileText },
  { name: 'AI Agents', icon: Bot },
  { name: 'Marketplace', icon: Store },
  { name: 'Notifications', icon: Bell },
  { name: 'Tavonza Card', icon: CreditCard },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
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
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-zinc-950 border-r border-zinc-800/80 flex flex-col md:sticky md:top-0 md:translate-x-0 md:z-50 flex-shrink-0 select-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header (Fixed at top of sidebar) */}
        <div className="h-20 px-5 border-b border-zinc-800/80 flex items-center justify-between flex-shrink-0 bg-zinc-950">
          <Link href="/" title="Back to Landing Page" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 bg-black rounded-[10px] flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 border border-zinc-800 group-hover:border-amber-500/50 transition-colors">
              <img
                src="/assets/costomerpages/customer-page-icon.svg"
                alt="Tavonza Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5 leading-snug group-hover:text-amber-400 transition-colors">
                Tavonza
               </div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest leading-tight">
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

        {/* Navigation Items (Scrolls independently, Zero Layout Shift on Hover/Active) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium border transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 text-white shadow-sm border-zinc-700/60 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800/50'
                }`}
              >
                <Icon
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.name === 'AI Agents' && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    PRO
                  </span>
                )}
                {item.name === 'Notifications' && (
                  <span className="ml-auto px-1.5 py-0.2 text-xs font-bold bg-rose-500 text-white rounded-full">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer (Fixed permanently at the bottom of the sidebar) */}
        <div className="p-3 border-t border-zinc-800/80 space-y-1 bg-zinc-950 flex-shrink-0 z-10">
          <button
            type="button"
            onClick={() => setActiveNav('Settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-base font-medium border transition-colors cursor-pointer ${
              activeNav === 'Settings'
                ? 'bg-zinc-800/90 text-white font-semibold border-zinc-700/60'
                : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-800/50'
            }`}
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-base font-medium border border-transparent text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
