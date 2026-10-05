import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Order | New Waiter Station | Tavonza AI',
  description: 'Create new table order, customize items, and send to kitchen.',
};

export default function NewWaiterCreateOrderPage() {
  return (
    <AuthGuard>
      <NewWaiterLandingView initialTab="create-order" />
    </AuthGuard>
  );
}
