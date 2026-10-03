'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { isCashierAuthenticated } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const roleUpper = String(user?.role || '').toUpperCase();
  const hasCashierRole =
    !user || roleUpper === 'CASHIER' || user.assignments?.some((a: any) => String(a?.role || '').toUpperCase() === 'CASHIER');
  const isAuth = (isAuthenticated && hasCashierRole) || isCashierAuthenticated();

  useEffect(() => {
    if (isInitialized && !isAuth) {
      router.replace('/login');
    }
  }, [isInitialized, isAuth, router]);

  // Loading state: ALWAYS show loading spinner until session initialization is complete
  // This guarantees the dashboard will NEVER flash/render before redirecting to login
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          T
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-['Inter']">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Verifying Cashier Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not a cashier, block render while router.replace('/login') executes
  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
