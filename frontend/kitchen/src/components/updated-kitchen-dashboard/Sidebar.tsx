"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Flame,
  BookOpen,
  Package,
  FileSpreadsheet,
  Sparkles,
  Settings,
  LogOut,
  X,
  Clock,
  User,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useAppSelector } from "@/redux/store";

export function TavonzaLogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" stroke="#FACC15" strokeWidth="9" />
      <rect x="44" y="6" width="12" height="12" fill="#000000" />
      <rect x="44" y="82" width="12" height="12" fill="#000000" />
      <circle cx="50" cy="50" r="20" stroke="#FACC15" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="#FACC15" />
    </svg>
  );
}

export interface KitchenSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const updatedKitchenNavItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Kitchen Queue", icon: Clock, badge: "8", badgeColor: "text-amber-400 bg-amber-500/10" },
  { name: "Active Orders", icon: UtensilsCrossed, badge: "4", badgeColor: "text-yellow-400 bg-yellow-500/10" },
  { name: "Stations", icon: Flame },
  { name: "Recipes", icon: BookOpen },
  { name: "Inventory", icon: Package, badge: "1 Low", badgeColor: "text-rose-400 bg-rose-500/10" },
  { name: "Shift Report", icon: FileSpreadsheet },
  { name: "AI Insights", icon: Sparkles, isPro: true },
  { name: "Profile", icon: User },
  { name: "Settings", icon: Settings },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: KitchenSidebarProps) {
  const { handleLogout } = useLogout();
  const { user } = useAppSelector((state) => state.auth);
  const isDashboardView = activeNav === "Dashboard";

  const chefName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Marco Vance');
  const chefInitials = chefName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'MV';

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Mobile/Overlay Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-72 h-screen bg-black border-r border-white/15 shadow-[0px_0px_11px_0px_rgba(255,255,255,0.15)] flex flex-col shrink-0 select-none transition-transform duration-300 ${
          isDashboardView
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:sticky md:top-0 md:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 px-5 border-b border-white/15 flex items-center justify-between shrink-0 bg-black">
          <Link href="/" title="Back to Landing Page" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden p-1.5 shrink-0 shadow-inner group-hover:border-amber-500/50 transition-colors">
              <TavonzaLogoIcon className="w-full h-full text-yellow-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 leading-snug font-['Inter'] group-hover:text-amber-400 transition-colors">
                Tavonza
              </div>
              <div className="text-[10px] font-normal text-white/40 uppercase tracking-widest leading-tight font-['Inter']">
                Kitchen Terminal
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          {updatedKitchenNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveNav(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium font-['Inter'] transition group cursor-pointer ${
                  isActive
                    ? "bg-yellow-400 text-black font-semibold shadow-md shadow-yellow-400/10"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? "text-black" : "text-zinc-400 group-hover:text-amber-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-black/20 text-black" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    AI PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-white/15 bg-black shrink-0">
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition">
            <button
              type="button"
              onClick={() => {
                setActiveNav("Profile");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer text-left"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-bold text-xs flex items-center justify-center shrink-0">
                {chefInitials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate font-['Inter']">
                  {chefName}
                </span>
                <span className="text-[10px] text-zinc-400 truncate font-['Inter']">
                  Kitchen Staff
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer shrink-0"
              title="Sign Out Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
