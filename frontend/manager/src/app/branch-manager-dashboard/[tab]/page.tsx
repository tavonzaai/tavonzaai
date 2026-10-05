import React from 'react';
import BranchManagerDashboard from '@/components/branch-manager-dashboard/BranchManagerDashboard';
import { routeToNav } from '@/components/branch-manager-dashboard/routes';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = routeToNav[tabParam] || 'Dashboard';
  return {
    title: `${tabName} | Branch Manager Command Center | Tavonza AI`,
    description: `Tavonza Branch Manager ${tabName} operations terminal for tables, live orders, staff roster, kitchen KDS, and shift controls.`,
  };
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BranchManagerTabPage({
  params,
}: {
  params: { tab: string };
}) {
  /*
  const cookieStore = await cookies();
  const token =
    cookieStore.get('branch_manager_token')?.value ||
    cookieStore.get('access_token')?.value;
  const user = cookieStore.get('branch_manager_user')?.value;

  if (!token || !user) {
    redirect('/login');
  }
  */

  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = routeToNav[tabParam] || 'Dashboard';

  return (
    <AuthGuard>
      <BranchManagerDashboard initialNav={tabName} />
    </AuthGuard>
  );
}
