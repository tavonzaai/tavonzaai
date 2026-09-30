'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreateAccountView from '@/components/auth/CreateAccountView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getMe } from '@/redux/features/authApi';
import { setCookie } from '@/redux/api/baseApi';

function RegisterContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const table = searchParams.get('table');
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  const forwardParam = table ? `?table=${encodeURIComponent(table)}` : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role || (user as any)?.globalRole || '').toUpperCase();
  const isCustomer = isAuthenticated && userRole === 'CUSTOMER';

  useEffect(() => {
    if (mounted && isInitialized && isCustomer) {
      if (table && typeof window !== 'undefined') {
        const formatted = table.toLowerCase().startsWith('table')
          ? table
          : `Table ${table.padStart(2, '0')}`;
        setCookie('tavonza_table', formatted);
      }
      router.replace(`/menu${forwardParam}`);
    }
  }, [mounted, isInitialized, isCustomer, table, forwardParam, router]);

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

  return (
    <AuthDesktopLayout>
      <CreateAccountView
        onAccountCreated={() => router.push(`/welcome${forwardParam}`)}
        onGoBackToLogin={() => router.push(`/login${forwardParam}`)}
      /> 
    </AuthDesktopLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
