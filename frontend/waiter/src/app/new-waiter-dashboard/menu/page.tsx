import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Menu | New Waiter Station | Tavonza AI',
  description: 'Interactive restaurant menu, food categories, and order creation.',
};

export default function NewWaiterMenuPage() {
  return (
    <AuthGuard>
      <NewWaiterLandingView initialTab="menu" />
    </AuthGuard>
  );
}
