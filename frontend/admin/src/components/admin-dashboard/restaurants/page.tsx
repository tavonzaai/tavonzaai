import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Restaurants & Location Management',
  description: 'Manage restaurants, locations, branches, and assigned operating teams.',
};

export default function RestaurantsPage() {
  return <OwnerDashboard initialNav="Restaurants" />;
}
