'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppSelector } from '@/redux/store';
import { isCashierAuthenticated } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  // const returnUrl = '/cashier-dashboard/dashboard';
  const returnUrl = '/updated-cashier-dashboard/table-view';
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAuth = isAuthenticated || isCashierAuthenticated();

  // Ensure the browser address bar is always clean '/login' with no query parameters
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
    <AuthDesktopLayout>
      <LoginView onLoginSuccess={() => router.replace(returnUrl)} />
    </AuthDesktopLayout>
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
