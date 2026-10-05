import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Table Order Details | New Waiter Station | Tavonza AI',
  description: 'Live table order details, cooking status, and bill settlement.',
};

export default function NewWaiterTableOrdersPage() {
  return (
    <AuthGuard>
      <NewWaiterLandingView initialTab="table-orders" />
    </AuthGuard>
  );
}
