import React from 'react';
import NewWaiterShell from '@/components/new-waiter-dashboard/navigation/NewWaiterShell';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export default function NewWaiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NewWaiterShell>{children}</NewWaiterShell>
    </AuthGuard>
  );
}

