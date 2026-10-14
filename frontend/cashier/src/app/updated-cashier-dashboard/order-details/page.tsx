import React, { Suspense } from 'react';
import CashierDashboardView from '@/components/updated-cashier-dashboard/CashierDashboardView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order Details | Cashier Terminal | Tavonza AI',
  description: 'Detailed order breakdown, live kitchen cooking status, itemized receipt, and counter cash settlement.',
};

export default function OrderDetailsPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CashierDashboardView initialNav="Order Details" />
      </Suspense>
    </AuthGuard>
  );
}
