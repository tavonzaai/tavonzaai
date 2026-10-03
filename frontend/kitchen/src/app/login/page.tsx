'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppSelector } from '@/redux/store';
import { isKitchenAuthenticated, getStoredKitchenUser } from '@/lib/auth';
import { isRoleAllowedForKitchen } from '@/redux/ReduxProvider';

function LoginContent() {
  const router = useRouter();
  const returnUrl = '/updated-kitchen-dashboard/dashboard';
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check if session exists in Redux state or in cookies
  const activeUser = user || (typeof document !== 'undefined' ? getStoredKitchenUser() : null);
  const hasKitchenRole = activeUser ? isRoleAllowedForKitchen(activeUser) : false;
  const isAuth = isKitchenAuthenticated() && (isAuthenticated || hasKitchenRole);

  // Ensure the browser address bar is always clean '/login' with no query parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  // Check user session: If user has active kitchen session, redirect to dashboard
  useEffect(() => {
    if (isAuth) {
      router.replace(returnUrl);
    }
  }, [isAuth, returnUrl, router]);

  // Shows login page directly; if user has no session, it remains shown
  return (
    <AuthDesktopLayout>
      <LoginView
        onLoginSuccess={() => router.replace(returnUrl)}
        onForgotPassword={() => router.push('/forgot-password')}
        onNavigateToVerify={(email) => router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=email_verification`)}
      />
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
