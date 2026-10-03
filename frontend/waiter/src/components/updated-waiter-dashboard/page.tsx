import React from 'react';
import WaiterDashboard from './WaiterDashboard';

export const metadata = {
  title: 'Waiter Station Dashboard | Tavonza AI Hospitality',
  description: 'Real-time waiter station dashboard for table views, ad-hoc speed requests, order taking, and AI operations.',
};

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab =
    (Array.isArray(resolvedParams?.tab)
      ? resolvedParams?.tab[0]
      : resolvedParams?.tab) || 'floor-view';

  return <WaiterDashboard initialTab={tab} />;
}
