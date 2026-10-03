import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Customer Base & Loyalty Management',
  description: 'Manage customers, segment insights, visits, total spending, and customer profiles.',
};

export default function CustomersPage() {
  return <OwnerDashboard initialNav="Customers" />;
}
