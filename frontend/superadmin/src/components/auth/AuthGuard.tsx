'use client';

import React from 'react';
import { useAppSelector } from '@/redux/store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          S
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-inter">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading Tavonza AI Super Admin...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
