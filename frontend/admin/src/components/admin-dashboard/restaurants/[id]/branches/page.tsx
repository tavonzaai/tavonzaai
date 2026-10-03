import OwnerDashboard from '../../../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Restaurant Branches Management',
  description: 'Manage branch locations, teams, and operations for your restaurant.',
};

export default async function RestaurantBranchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <OwnerDashboard
      initialNav="Restaurants"
      initialBranchRestaurantId={id}
    />
  );
}
