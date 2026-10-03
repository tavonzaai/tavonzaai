import OwnerDashboard from './OwnerDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tavonza — AI Hospitality Admin Dashboard',
  description: 'Real-time AI-powered hospitality business intelligence and operations management.',
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; branch?: string; restaurant?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab =
    (Array.isArray(resolvedParams?.tab)
      ? resolvedParams?.tab[0]
      : resolvedParams?.tab) || undefined;
  const branch =
    (Array.isArray(resolvedParams?.branch)
      ? resolvedParams?.branch[0]
      : resolvedParams?.branch) ||
    (Array.isArray(resolvedParams?.restaurant)
      ? resolvedParams?.restaurant[0]
      : resolvedParams?.restaurant) ||
    undefined;

  return <OwnerDashboard initialTab={tab} initialBranchRestaurantId={branch} />;
}

