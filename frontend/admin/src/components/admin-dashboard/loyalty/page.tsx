import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Loyalty Program & Rewards Management',
  description: 'Manage rewards catalog, customer tiers, points issued/redeemed, and track recent loyalty activity.',
};

export default function LoyaltyPage() {
  return <OwnerDashboard initialNav="Loyalty" />;
}
