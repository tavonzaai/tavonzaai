import OwnerDashboard from '../../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Restaurant Branches Management',
  description: 'Manage branch locations, teams, and operations for your restaurant.',
};

export default function BranchesPage() {
  return <OwnerDashboard initialNav="Restaurants" />;
}
