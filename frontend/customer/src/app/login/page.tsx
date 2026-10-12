'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginView from '@/components/auth/LoginView';
import AuthDesktopLayout from '@/components/auth/AuthDesktopLayout';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setCookie } from '@/redux/api/baseApi';
import { resolveDynamicBranchId, resolveDynamicTableId } from '@/context/CartContext';
import { getActiveCustomerOrder } from '@/redux/features/orderApi';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const qr = searchParams.get('qr');
  const table = searchParams.get('table');
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  const forwardParam = qr
    ? `?qr=${encodeURIComponent(qr)}`
    : table
    ? `?table=${encodeURIComponent(table)}`
    : '';

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

      const branchId = resolveDynamicBranchId();
      const tableId = resolveDynamicTableId(null, table);
      getActiveCustomerOrder(branchId, tableId)
        .then((activeOrder) => {
          if (activeOrder) {
            router.replace(
              `/orders/track?order=${encodeURIComponent(activeOrder.orderId || activeOrder.id)}&table=${encodeURIComponent(table || '')}`
            );
          } else {
            router.replace(`/menu${forwardParam}`);
          }
        })
        .catch(() => {
          router.replace(`/menu${forwardParam}`);
        });
    }
  }, [mounted, isInitialized, isCustomer, table, forwardParam, router]);

  if (!mounted || !isInitialized || isCustomer) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-300 text-sm font-medium tracking-wide">
          {isCustomer ? 'Checking your orders...' : 'Loading Tavonza...'}
        </p>
      </div>
    );
  }

  const handleNavigateToVerify = (email: string) => {
    const qrParam = qr ? `&qr=${encodeURIComponent(qr)}` : (table ? `&table=${encodeURIComponent(table)}` : '');
    router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=email_verification${qrParam}`);
  };

  const handleLoginSuccess = async () => {
    try {
      const branchId = resolveDynamicBranchId();
      const tableId = resolveDynamicTableId(null, table);
      const activeOrder = await getActiveCustomerOrder(branchId, tableId);
      if (activeOrder) {
        router.push(
          `/orders/track?order=${encodeURIComponent(activeOrder.orderId || activeOrder.id)}&table=${encodeURIComponent(table || '')}`
        );
        return;
      }
    } catch {
      // fallback to menu
    }
    router.push(`/menu${forwardParam}`);
  };

  return (
    <AuthDesktopLayout>
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => router.push(`/forgot-password${forwardParam}`)}
        onCreateAccount={() => router.push(`/register${forwardParam}`)}
        onNavigateToVerify={handleNavigateToVerify}
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
