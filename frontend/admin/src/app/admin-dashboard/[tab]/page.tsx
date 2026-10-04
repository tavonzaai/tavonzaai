import React from 'react';
import OwnerDashboard from '@/components/admin-dashboard/OwnerDashboard';
import { routeToNav } from '@/components/admin-dashboard/routes';

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
    title: `${tabName} | Admin Console | Tavonza AI`,
    description: `Enterprise ${tabName} operations command center for Tavonza AI Hospitality.`,
  };
}

export default async function AdminTabPage({
  params,
  searchParams,
}: {
  params: { tab: string };
  searchParams?: { branch?: string; restaurant?: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = routeToNav[tabParam] || 'Dashboard';
  const branch = searchParams?.branch || searchParams?.restaurant;

  return <OwnerDashboard initialTab={tabName} initialBranchRestaurantId={branch} />;
}
