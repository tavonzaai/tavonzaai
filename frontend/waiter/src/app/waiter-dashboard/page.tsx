import { redirect } from 'next/navigation';
import WaiterDashboard from '@/components/waiter-dashboard/WaiterDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Waiter Dashboard | Tavonza AI Hospitality',
  description: 'Real-time waiter station dashboard for tables, live orders, alerts, and AI copilot.',
};

export default async function WaiterDashboardIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab = resolvedParams?.tab;
  if (tab) {
    return <WaiterDashboard initialNav={tab} />;
  }
  redirect('/new-waiter-dashboard');
  // redirect('/waiter-dashboard/dashboard');
}
