import React from 'react';
import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Restaurants Management | Tavonza Owner Dashboard',
  description:
    'Manage your restaurants, locations, and assigned teams. Add new restaurants, view branches, and edit configurations.',
};

export const dynamic = 'force-dynamic';

export default async function OwnerRestaurantsPage({
  searchParams,
}: {
  searchParams?: Promise<{ branchRestaurantId?: string; id?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const branchRestaurantId =
    (Array.isArray(resolvedParams?.branchRestaurantId)
      ? resolvedParams?.branchRestaurantId[0]
      : resolvedParams?.branchRestaurantId) ||
    (Array.isArray(resolvedParams?.id)
      ? resolvedParams?.id[0]
      : resolvedParams?.id);

  return (
    <OwnerDashboard
      initialTab="restaurants"
      initialBranchRestaurantId={branchRestaurantId}
    />
  );
}
