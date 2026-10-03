import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Menu Management',
  description: 'Manage items, pricing, categories, and inventory margins.',
};

export default function MenuPage() {
  return <OwnerDashboard initialNav="Menu" />;
}
