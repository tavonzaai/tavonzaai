import React from 'react';
import WaiterDashboard from '@/components/waiter-dashboard/WaiterDashboard';
import { routeToNav } from '@/components/waiter-dashboard/routes';

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
    title: `${tabName} | Waiter Command Center | Tavonza AI`,
    description: `Waiter ${tabName} terminal command center for table operations, guest orders, service requests, and notifications.`,
  };
}

export default async function WaiterTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = routeToNav[tabParam] || 'Dashboard';

  return <WaiterDashboard initialNav={tabName} />;
}
