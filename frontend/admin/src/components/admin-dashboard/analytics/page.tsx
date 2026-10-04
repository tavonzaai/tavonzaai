import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Performance Analytics & Insights',
  description: 'Deep dive into restaurant performance metrics, revenue trends, hourly traffic, category splits, server rankings, and customer volume.',
};

export default function AnalyticsPage() {
  return <OwnerDashboard initialNav="Analytics" />;
}
