import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export default function NewWaiterDashboardIndexPage() {
  return (
    <AuthGuard>
      <NewWaiterLandingView initialTab="home" />
    </AuthGuard>
  );
}
