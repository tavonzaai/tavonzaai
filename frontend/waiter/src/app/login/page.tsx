'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppSelector } from '@/redux/store';
import { isWaiterAuthenticated, getStoredWaiterUser } from '@/lib/auth';
import { isRoleAllowedForWaiter } from '@/redux/ReduxProvider';

function LoginContent() {
  const router = useRouter();
  const returnUrl = '/new-waiter-dashboard/dashboard';
  // const returnUrl = '/waiter-dashboard/dashboard';
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check if session exists in Redux state or in cookies
  const activeUser = user || (typeof document !== 'undefined' ? getStoredWaiterUser() : null);
  const hasWaiterRole = activeUser ? isRoleAllowedForWaiter(activeUser) : false;
  const isAuth = isWaiterAuthenticated() && (isAuthenticated || hasWaiterRole);

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
      <LoginView
        onLoginSuccess={() => router.replace(returnUrl)}
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </AuthDesktopLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
