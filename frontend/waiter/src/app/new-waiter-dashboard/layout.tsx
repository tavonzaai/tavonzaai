import React from 'react';
import NewWaiterShell from '@/components/new-waiter-dashboard/navigation/NewWaiterShell';

export const dynamic = 'force-dynamic';

export default function NewWaiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NewWaiterShell>{children}</NewWaiterShell>;
}
