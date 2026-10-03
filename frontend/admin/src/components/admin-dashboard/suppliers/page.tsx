import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Suppliers & Vendor Operations',
  description: 'Manage supplier relationships, purchase orders, deliveries, and vendor reliability.',
};

export default function SuppliersPage() {
  return <OwnerDashboard initialNav="Suppliers" />;
}
