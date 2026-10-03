import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

const tabMap: Record<string, string> = {
  'dashboard': 'home',
  'home': 'home',
  'floor-view': 'home',
  'table-view': 'home',
  'table-orders': 'table-orders',
  'table-order': 'table-orders',
  'table-detail': 'table-orders',
  'table-01': 'table-orders',
  'menu': 'menu',
  'browse-menu': 'menu',
  'create-order': 'create-order',
  'orders': 'order',
  'order': 'order',
  'order-status': 'order',
  'order-requests': 'order',
  'alerts': 'alert',
  'alert': 'alert',
  'checkout': 'home',
  'bill-checkout': 'home',
  'jarvis': 'jarvis',
  'profile': 'profile',
};

const titleMap: Record<string, string> = {
  'dashboard': 'Waiter Floor Landing',
  'home': 'Waiter Floor Landing',
  'floor-view': 'Floor View',
  'table-view': 'Table View',
  'table-orders': 'Table Order Details',
  'table-order': 'Table Order Details',
  'table-detail': 'Table Order Details',
  'table-01': 'Table-01 Order Details',
  'menu': 'Browse Menu',
  'browse-menu': 'Browse Menu',
  'create-order': 'Create Order',
  'orders': 'Taking Orders',
  'order': 'Taking Orders',
  'order-status': 'Order Status',
  'order-requests': 'Order Requests',
  'alerts': 'Live Alerts & Ad-Hoc Requests',
  'alert': 'Live Alerts & Ad-Hoc Requests',
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
  const tabTitle = titleMap[tabParam] || 'Waiter Landing';
  return {
    title: `${tabTitle} | New Waiter Station | Tavonza AI`,
    description: `New Waiter ${tabTitle} terminal command center for floor tables, touch POS, live alerts, and bill settlement.`,
  };
}

export default async function NewWaiterTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const initialTab = tabMap[tabParam] || 'home';

  return (
    <AuthGuard>
      <NewWaiterLandingView initialTab={initialTab} />
    </AuthGuard>
  );
}
