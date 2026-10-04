import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Integrations & Apps Marketplace',
  description: '50+ integrations to streamline operations, boost revenue, and delight customers.',
};

export default function MarketplacePage() {
  return <OwnerDashboard initialNav="Marketplace" />;
}
