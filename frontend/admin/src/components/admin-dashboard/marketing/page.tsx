import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Marketing & AI Campaign Management',
  description: 'Create and track SMS, email, and push campaigns with AI optimization.',
};

export default function MarketingPage() {
  return <OwnerDashboard initialNav="Marketing" />;
}
