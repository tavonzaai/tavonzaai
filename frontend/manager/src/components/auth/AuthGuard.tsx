'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../redux/hooks';
import { isManagerAuthenticated } from '../../lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const roleUpper = String(user?.role || '').toUpperCase();
  const hasManagerRole =
    Boolean(user) &&
    (roleUpper.includes('MANAGER') ||
      roleUpper === 'ADMIN' ||
      roleUpper === 'OWNER' ||
      user?.assignments?.some((a: any) => String(a?.role || '').toUpperCase().includes('MANAGER')));

  const isAuth = isAuthenticated && hasManagerRole && isManagerAuthenticated();

  useEffect(() => {
    /*
    if (isInitialized && !isAuth) {
      router.replace('/login');
    }
    */
  }, [isInitialized, isAuth, router]);

  // Loading state while session check completes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          T
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-['Inter']">
          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          <span>Verifying Branch Manager Session...</span>
        </div>
      </div>
    );
  }

  /*
  // Block rendering while redirecting
  if (!isAuth) {
    return null;
  }
  */

  return <>{children}</>;
}
