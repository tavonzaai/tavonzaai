'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { isKitchenAuthenticated } from '@/lib/auth';
import { isRoleAllowedForKitchen } from '@/redux/ReduxProvider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const hasKitchenRole = user ? isRoleAllowedForKitchen(user) : false;
  const isAuth = isAuthenticated && hasKitchenRole && isKitchenAuthenticated();

  useEffect(() => {
    if (isInitialized && !isAuth) {
      router.replace('/login');
    }
  }, [isInitialized, isAuth, router]);

  // Loading state: ALWAYS show loading spinner until session initialization is complete
  // Prevents flashing of dashboard content before authentication is verified
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          T
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-['Inter']">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Verifying Kitchen Display Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not a kitchen user, block render while redirecting to /login
  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
