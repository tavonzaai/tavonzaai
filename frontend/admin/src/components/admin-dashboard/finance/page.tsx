import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Finance & Profitability Analytics',
  description: 'Track revenue vs expenses vs profit, expense breakdowns, and monthly Profit & Loss statements.',
};

export default function FinancePage() {
  return <OwnerDashboard initialNav="Finance" />;
}
