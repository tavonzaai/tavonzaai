import React from 'react';
import { redirect } from 'next/navigation';
import KitchenDashboardView from '@/components/kitchen-dashboard/KitchenDashboardView';
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
    title: `${tabName} | Kitchen Display | Tavonza AI`,
    description: `Kitchen ${tabName} command center for dish preparation, ticket fulfillment, and station monitoring.`,
  };
}

export default async function KitchenTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  if (tabParam === 'profile') {
    redirect('/profile');
  }
  const tabName = tabMap[tabParam] || 'Dashboard';

  return (
    <AuthGuard>
      <KitchenDashboardView initialNav={tabName} />
    </AuthGuard>
  );
}
