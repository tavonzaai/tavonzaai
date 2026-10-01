import React from 'react';
import CashierDashboard from '@/components/cashier-dashboard/CashierDashboard';
import { routeToNav } from '@/components/cashier-dashboard/routes';

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
    title: `${tabName} | Cashier Command Center | Tavonza AI`,
    description: `Cashier ${tabName} terminal command center for POS orders, transactions, payment analytics, and checkout workflow.`,
  };
}

export default async function SimpleCashierTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = routeToNav[tabParam] || 'Dashboard';

  return <CashierDashboard initialNav={tabName} />;
}
