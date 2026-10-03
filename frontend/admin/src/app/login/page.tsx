'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppSelector } from '@/redux/store';
import { isAdminAuthenticated, getStoredAdminUser } from '@/lib/auth';
import { isRoleAllowedForAdmin } from '@/redux/ReduxProvider';

function LoginContent() {
  const router = useRouter();
  const returnUrl = '/admin-dashboard/dashboard';
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const activeUser = user || (typeof document !== 'undefined' ? getStoredAdminUser() : null);
  const hasAdminRole = activeUser ? isRoleAllowedForAdmin(activeUser) : false;
  const isAuth = isAdminAuthenticated() && (isAuthenticated || hasAdminRole);

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
