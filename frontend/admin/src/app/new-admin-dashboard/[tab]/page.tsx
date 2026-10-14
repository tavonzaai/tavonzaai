import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import NewAdminDashboard from '@/components/new-admin-dashboard/NewAdminDashboard';
import AuthGuard from '@/components/auth/AuthGuard';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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
  searchParams,
}: {
  params: { tab: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await params;
  const resolvedSearch = (await searchParams) || {};
  const tabParam = resolvedParams?.tab || 'dashboard';

  if (tabParam === 'branches') {
    const branchId = firstParam(resolvedSearch.branchId) || firstParam(resolvedSearch.branch);
    if (branchId && UUID_PATTERN.test(branchId)) {
      redirect(`/new-admin-dashboard/branches/${branchId}/overview`);
    }
  }

  if (tabParam === 'restaurants') {
    const restaurantId = firstParam(resolvedSearch.id) || firstParam(resolvedSearch.restaurant);
    if (restaurantId && UUID_PATTERN.test(restaurantId)) {
      redirect(`/new-admin-dashboard/restaurants/${restaurantId}`);
    }
  }

  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading console...</div>}>
        <NewAdminDashboard initialTab={tabParam} />
      </Suspense>
    </AuthGuard>
  );
}

