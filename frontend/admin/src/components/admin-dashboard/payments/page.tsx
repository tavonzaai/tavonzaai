import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Payments & Transactions',
  description: 'Track real-time transactions, tips, payment methods, and revenue analytics for today.',
};

export default function PaymentsPage() {
  return <OwnerDashboard initialNav="Payments" />;
}
