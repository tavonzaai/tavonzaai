"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  PlusCircle,
  Receipt,
  LogOut,
  X,
  UserCheck,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

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

export interface CashierSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Exactly 3 routes matching Figma Cashier Dashboard design specifications
export const cashierNavItems = [
  { name: "Table View", icon: LayoutGrid, href: "/updated-cashier-dashboard/table-view" },
  { name: "Create Order", icon: PlusCircle, href: "/updated-cashier-dashboard/create-order" },
  { name: "Bill Queue", icon: Receipt, href: "/updated-cashier-dashboard/bill-queue" },
];

export default function CashierSidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  setSidebarOpen,
}: CashierSidebarProps) {
  const { handleLogout } = useLogout();
  const pathname = usePathname();

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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 h-screen bg-black border-r border-neutral-800 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.40)] flex flex-col lg:relative lg:top-0 lg:translate-x-0 shrink-0 select-none transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-[77px] px-6 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-black">
          <Link href="/updated-cashier-dashboard/table-view" title="Back to Dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-zinc-900 border border-neutral-800 rounded-xl flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-inner group-hover:border-amber-500/50 transition-colors">
              <TavonzaLogoIcon className="w-full h-full text-yellow-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-4 font-['Inter'] group-hover:text-amber-400 transition-colors">
                Tavonza
              </div>
              <div className="text-xs font-normal text-white/30 uppercase tracking-tight leading-4 font-['Inter'] mt-0.5">
                Cashier
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-6 space-y-2 no-scrollbar">
          {cashierNavItems.map((item) => {
            const Icon = item.icon;
            const isPathActive = pathname === item.href || activeNav.toLowerCase() === item.name.toLowerCase();

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  setActiveNav(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-base font-normal font-['Inter'] transition cursor-pointer ${
                  isPathActive
                    ? "bg-zinc-800 text-white shadow-md font-semibold"
                    : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-6 h-6 transition ${
                      isPathActive ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-4 border-t border-neutral-800 bg-black shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 bg-zinc-900 rounded-lg border border-neutral-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 p-2.5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-white truncate font-['Poppins'] leading-4">
                  Nobin Mille
                </span>
                <span className="text-xs font-medium text-slate-500 truncate font-['Poppins'] leading-4">
                  Cashier
                </span>
              </div>
            </div>
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
