import React from 'react';
import WaiterDashboard from '@/components/updated-waiter-dashboard/WaiterDashboard';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

const tabMap: Record<string, string> = {
  'floor-view': 'floor-view',
  'table-view': 'floor-view',
  'orders': 'orders',
  'order-status': 'order-status',
  'order-requests': 'order-requests',
  'alerts': 'alerts',
  'checkout': 'checkout',
  'bill-checkout': 'checkout',
  'jarvis': 'jarvis',
  'profile': 'profile',
  'dashboard': 'floor-view',
};

const titleMap: Record<string, string> = {
  'floor-view': 'Floor View',
  'table-view': 'Table View',
  'orders': 'Taking Orders',
  'order-status': 'Order Status',
  'order-requests': 'Order Requests',
  'alerts': 'Live Alerts & Ad-Hoc Requests',
  'checkout': 'Bill Checkout',
  'bill-checkout': 'Bill Checkout',
  'jarvis': 'JARVIS Copilot',
  'profile': 'Waiter Profile',
};

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabTitle = titleMap[tabParam] || 'Floor View';
  return {
    title: `${tabTitle} | Updated Waiter Station | Tavonza AI`,
    description: `Updated Waiter ${tabTitle} terminal command center for floor tables, touch POS, live alerts, and bill settlement.`,
  };
}

export default async function UpdatedWaiterTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const initialTab = tabMap[tabParam] || 'floor-view';

  return (
    <AuthGuard>
      <WaiterDashboard initialTab={initialTab} />
    </AuthGuard>
  );
}
