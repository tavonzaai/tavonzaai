'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Layers,
  CreditCard,
  Settings,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/redux/store';
import { logoutUser } from '@/redux/features/authApi';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/superadmin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Tenants',
    href: '/superadmin/tenants',
    icon: Building2,
  },
  {
    name: 'Plans',
    href: '/superadmin/plans',
    icon: Layers,
  },
  {
    name: 'Billing',
    href: '/superadmin/billing',
    icon: CreditCard,
  },
  {
    name: 'Settings',
    href: '/superadmin/settings',
    icon: Settings,
  },
];

export function SuperAdminSidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'superadmin_logged_out=true; path=/; SameSite=Lax';
      }
      await dispatch(logoutUser()).unwrap();
      toast.success('Signed out successfully');
      router.push('/superadmin/login');
    } catch {
      router.push('/superadmin/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 w-56 bg-black border-r border-zinc-800 shadow-[0px_0px_11px_0px_rgba(255,255,255,0.08)] flex flex-col z-50 transition-transform duration-300 ease-in-out font-inter',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Brand matching Figma */}
        <div className="self-stretch h-20 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/superadmin/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="size-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0"
              style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
            >
              <div
                className="w-full h-full bg-black rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: '#000000' }}
              >
                <svg
                  width={20}
                  height={20}
                  style={{
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    minHeight: '20px',
                    maxWidth: '20px',
                    maxHeight: '20px',
                    color: '#facc15',
                    stroke: '#facc15',
                  }}
                  className="w-5 h-5 text-yellow-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v3" />
                  <path d="M12 18v3" />
                  <path d="M3 12h3" />
                  <path d="M18 12h3" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-white text-base font-bold leading-6">
                TablePilot
              </span>
              <span className="text-white/30 text-[10px] font-normal uppercase leading-4 tracking-wide">
                Super Admin
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items matching Figma */}
        <div className="self-stretch px-3 py-5 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/superadmin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'self-stretch px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm font-normal leading-5 group',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-900/60'
                )}
              >
                <Icon
                  className={cn(
                    'size-5 transition-colors shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  )}
                  style={{ width: 20, height: 20 }}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Platform Status matching exact Figma bottom layout */}
        <div className="self-stretch flex-1 flex flex-col justify-end items-start">
          <div className="self-stretch px-5 pb-5 flex flex-col justify-start items-start">
            <div className="self-stretch pt-4 border-t border-zinc-800 flex flex-col justify-start items-start gap-2">
              <span className="text-zinc-600 text-xs font-normal leading-4">
                Platform status
              </span>
              <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                <div className="size-1.5 relative bg-green-500 rounded-sm shadow-[0px_0px_8px_0px_rgba(34,197,94,1.00)]" />
                <span className="text-neutral-400 text-xs font-normal leading-4">
                  All systems operational
                </span>
              </div>
            </div>

            {/* My Profile & Logout buttons */}
            <div className="mt-3 flex items-center gap-1.5 w-full">
              <Link
                href="/superadmin/profile"
                onClick={onClose}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-md flex items-center gap-2 transition text-xs cursor-pointer',
                  pathname === '/superadmin/profile'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                )}
              >
                <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="py-1.5 px-2 rounded-md flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
