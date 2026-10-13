'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { isWaiterAuthenticated } from '@/lib/auth';
import { isRoleAllowedForWaiter } from '@/redux/ReduxProvider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const isLoginPage =
    pathname === '/login' ||
    pathname === '/new-waiter-dashboard/login' ||
    Boolean(pathname?.startsWith('/login')) ||
    Boolean(pathname?.startsWith('/verify-otp')) ||
    Boolean(pathname?.startsWith('/forgot-password')) ||
    Boolean(pathname?.startsWith('/reset-password'));

  const hasWaiterRole = user ? isRoleAllowedForWaiter(user) : false;
  const isAuth = isWaiterAuthenticated() && (isAuthenticated || hasWaiterRole || Boolean(user));

  useEffect(() => {
    if (isInitialized && !isAuth && !isLoginPage) {
      router.replace('/login');
    }
  }, [isInitialized, isAuth, isLoginPage, router]);

  // Public / auth pages render without session blocking
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state: ALWAYS show loading spinner until session initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          W
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-['Inter']">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Verifying Waiter Station Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, block render while router.replace('/login') executes
  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

