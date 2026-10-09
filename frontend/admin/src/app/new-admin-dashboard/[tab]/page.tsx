import React from 'react';
import NewAdminDashboard from '@/components/new-admin-dashboard/NewAdminDashboard';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab || 'Dashboard';
  const capitalized = tabParam.charAt(0).toUpperCase() + tabParam.slice(1);
  return {
    title: `${capitalized} | Admin Console | Tavonza AI`,
    description: `Enterprise ${capitalized} management command center for Tavonza AI Hospitality.`,
  };
}

export default async function NewAdminTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab || 'dashboard';

  return (
    <AuthGuard>
      <NewAdminDashboard initialTab={tabParam} />
    </AuthGuard>
  );
}
