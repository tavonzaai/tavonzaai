import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Inventory & Stock Management',
  description: 'Track stock levels, ingredients, min/max thresholds, and suppliers in real time.',
};

export default function InventoryPage() {
  return <OwnerDashboard initialNav="Inventory" />;
}
