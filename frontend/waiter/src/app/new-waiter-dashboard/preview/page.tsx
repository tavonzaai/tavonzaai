import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Waiter Station Preview | New Waiter Station | Tavonza AI',
  description: 'Interactive restaurant floor plan, table statuses, and seating layout.',
};

export default async function NewWaiterDashboardPreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = resolvedParams?.tab || 'home';
  return <NewWaiterLandingView initialTab={initialTab} />;
}
