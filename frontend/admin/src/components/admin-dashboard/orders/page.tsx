import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Orders Management',
  description: 'Manage and monitor all customer orders in real time.',
};

export default function OrdersPage() {
  return <OwnerDashboard initialNav="Orders" />;
}
