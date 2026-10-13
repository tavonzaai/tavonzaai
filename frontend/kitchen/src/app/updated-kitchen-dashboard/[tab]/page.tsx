import React from 'react';
import KitchenDashboardView from '@/components/updated-kitchen-dashboard/KitchenDashboardView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

const tabMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'kitchen-queue': 'Kitchen Queue',
  'active-orders': 'Active Orders',
  'stations': 'Stations',
  'recipes': 'Recipes',
  'inventory': 'Inventory',
  'shift-report': 'Shift Report',
  'ai-insights': 'AI Insights',
  'profile': 'Profile',
  'settings': 'Settings',
};

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = tabMap[tabParam] || 'Dashboard';
  return {
    title: `${tabName} | Updated Kitchen Display | Tavonza AI`,
    description: `Updated Kitchen ${tabName} command center for dish preparation, ticket fulfillment, and station monitoring.`,
  };
}

export default async function UpdatedKitchenTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = tabMap[tabParam] || 'Dashboard';

  return (
    <AuthGuard>
      <KitchenDashboardView initialNav={tabName} />
    </AuthGuard>
  );
}
