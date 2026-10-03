import React from 'react';
import OwnerDashboard from './OwnerDashboard';

export const metadata = {
  title: 'Admin Dashboard & Restaurants | Tavonza AI Hospitality',
  description:
    'Executive admin dashboard for multi-restaurant portfolio management, branch operations, real-time analytics, and teams.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; branchRestaurantId?: string; id?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab =
    (Array.isArray(resolvedParams?.tab)
      ? resolvedParams?.tab[0]
      : resolvedParams?.tab) || 'restaurants';

  const branchRestaurantId =
    (Array.isArray(resolvedParams?.branchRestaurantId)
      ? resolvedParams?.branchRestaurantId[0]
      : resolvedParams?.branchRestaurantId) ||
    (Array.isArray(resolvedParams?.id)
      ? resolvedParams?.id[0]
      : resolvedParams?.id);

  return (
    <OwnerDashboard
      initialTab={tab}
      initialBranchRestaurantId={branchRestaurantId}
    />
  );
}
