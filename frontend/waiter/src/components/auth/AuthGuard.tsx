'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const hasWaiterRole = user ? isRoleAllowedForWaiter(user) : false;
  const isAuth = isAuthenticated && hasWaiterRole && isWaiterAuthenticated();

  useEffect(() => {
    if (isInitialized && !isAuth) {
      router.replace('/login');
    }
  }, [isInitialized, isAuth, router]);

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
