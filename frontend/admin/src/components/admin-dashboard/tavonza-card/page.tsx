import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — VIP Loyalty Card Program',
  description: 'Manage your loyalty card members, points balances, tier progressions, and rewards.',
};

export default function TavonzaCardPage() {
  return <OwnerDashboard initialNav="Tavonza Card" />;
}
