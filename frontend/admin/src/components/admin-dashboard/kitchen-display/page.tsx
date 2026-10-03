import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Kitchen Display System (KDS)',
  description: 'Real-time kitchen order display, ticket tracking, and preparation workflow.',
};

export default function KitchenDisplayPage() {
  return <OwnerDashboard initialNav="Kitchen Display" />;
}
