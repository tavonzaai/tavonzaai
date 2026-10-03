import { redirect } from 'next/navigation';
import OwnerDashboard from '@/components/admin-dashboard/OwnerDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Command Center | Tavonza AI Hospitality',
  description: 'Real-time AI-powered enterprise hospitality business intelligence and operations management.',
};

export default async function AdminDashboardIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; branch?: string; restaurant?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab = resolvedParams?.tab;
  const branch = resolvedParams?.branch || resolvedParams?.restaurant;

  if (tab) {
    return <OwnerDashboard initialTab={tab} initialBranchRestaurantId={branch} />;
  }

  redirect('/admin-dashboard/dashboard');
}
