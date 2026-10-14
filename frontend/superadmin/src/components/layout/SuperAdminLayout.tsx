'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';
import { Shield, Loader2 } from 'lucide-react';

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/superadmin/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-inter text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Shield className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
            <span>Verifying Super Administrator credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-inter">
      {/* Sidebar */}
      <SuperAdminSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Top Header */}
      <SuperAdminHeader
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-56 pt-20 flex flex-col min-h-screen bg-black">
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-7 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
