import React from 'react';
import OwnerDashboard from '@/components/updated-admin-dashboard/OwnerDashboard';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export default async function UpdatedAdminTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab || 'Dashboard';

  return (
    <AuthGuard>
      <OwnerDashboard initialTab={tabParam} />
    </AuthGuard>
  );
}
