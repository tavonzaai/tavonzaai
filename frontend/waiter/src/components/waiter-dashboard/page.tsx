import React from 'react';
import WaiterDashboard from './WaiterDashboard';

export const metadata = {
  title: 'Waiter Dashboard | Tavonza AI Hospitality',
  description: 'Real-time waiter station dashboard for tables, live orders, alerts, and AI copilot.',
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
      : resolvedParams?.tab) || 'Dashboard';

  return <WaiterDashboard initialNav={tab} />;
}
