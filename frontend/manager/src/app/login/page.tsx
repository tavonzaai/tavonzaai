'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '../../components/auth/LoginView';
import { useAppSelector } from '../../redux/hooks';
import { isManagerAuthenticated } from '../../lib/auth';

function LoginContent() {
  const router = useRouter();
  const returnUrl = '/branch-manager-dashboard/dashboard';
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAuth = isAuthenticated || isManagerAuthenticated();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  useEffect(() => {
    if (isAuth) {
      router.replace(returnUrl);
    }
  }, [isAuth, returnUrl, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-400/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 w-full">
        <LoginView onLoginSuccess={() => router.replace(returnUrl)} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
