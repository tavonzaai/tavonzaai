import React from 'react';
import CashierDashboardView from '@/components/updated-cashier-dashboard/CashierDashboardView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

const tabMap: Record<string, string> = {
  'table-view': 'Table View',
  'create-order': 'Create Order',
  'bill-queue': 'Bill Queue',
  'dashboard': 'Table View',
};

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const tabName = tabMap[tabParam] || 'Table View';
  return {
    title: `${tabName} | Updated Cashier Terminal | Tavonza AI`,
    description: `Updated Cashier ${tabName} terminal command center for counter POS orders, table billing, and settlement workflow.`,
  };
}

export default async function UpdatedCashierTabPage({
  params,
}: {
  params: { tab: string };
}) {
  const resolvedParams = await params;
  const tabParam = resolvedParams?.tab?.toLowerCase() || '';
  const initialNav = tabMap[tabParam] || 'Table View';

  return (
    <AuthGuard>
      <CashierDashboardView initialNav={initialNav} />
    </AuthGuard>
  );
}
