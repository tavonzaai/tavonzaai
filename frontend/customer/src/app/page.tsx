'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getMe } from '@/redux/features/authApi';
import { setCookie } from '@/redux/api/baseApi';
import CreateAccountView from '@/components/auth/CreateAccountView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import BottomNav from '@/components/dashboard/BottomNav';
import JarvisChatView from '@/components/dashboard/JarvisChatView';
import MenuPage from './menu/page';
 
function LandingPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  const tableParam = searchParams.get('table');
  const forwardParam = tableParam ? `?table=${encodeURIComponent(tableParam)}` : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role || (user as any)?.globalRole || '').toUpperCase();
  const isCustomer = isAuthenticated && userRole === 'CUSTOMER';

  useEffect(() => {
    if (mounted && isInitialized && isCustomer) {
      // User is verified as CUSTOMER via session - redirect directly to menu
      if (tableParam) {
        if (typeof window !== 'undefined') {
          const formatted = tableParam.toLowerCase().startsWith('table')
            ? tableParam
            : `Table ${tableParam.padStart(2, '0')}`;
          setCookie('tavonza_table', formatted);
        }
        router.replace(`/menu?table=${encodeURIComponent(tableParam)}`);
      } else {
        router.replace('/menu');
      }
    }
  }, [mounted, isInitialized, isCustomer, tableParam, router]);

  // While rendering on server or checking session, show uniform loading state (prevents hydration mismatch)
  if (!mounted || !isInitialized || isCustomer) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-300 text-sm font-medium tracking-wide">
          {isCustomer ? 'Redirecting to menu...' : 'Loading Tavonza...'}
        </p>
      </div>
    );
  }

  const handleAccountCreated = (email?: string) => {
    const tableParamQuery = tableParam ? `&table=${encodeURIComponent(tableParam)}` : '';
    const emailParam = email ? `email=${encodeURIComponent(email)}&` : '';
    router.push(`/verify-otp?${emailParam}type=email_verification${tableParamQuery}`);
  };

  const handleGoBackToLogin = (email?: string) => {
    const emailQuery = email ? `email=${encodeURIComponent(email)}` : '';
    let target = `/login${forwardParam}`;
    if (emailQuery) {
      target += target.includes('?') ? `&${emailQuery}` : `?${emailQuery}`;
    }
    router.push(target);
  };

  // Not authenticated: render customer landing menu page directly
  return (
    <>
      <MenuPage />
      {/* 
      <AuthDesktopLayout>
        <CreateAccountView
          onAccountCreated={handleAccountCreated}
          onGoBackToLogin={handleGoBackToLogin}
        />
      </AuthDesktopLayout> 
      */}
    </>
  );
}

export default function CustomerLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}


