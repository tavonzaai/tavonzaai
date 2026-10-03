import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Point of Sale (POS)',
  description: 'Point of Sale terminal and order checkout management.',
};

export default function POSPage() {
  return <OwnerDashboard initialNav="POS" />;
}
