import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Business Intelligence & AI Predictive Analytics',
  description: 'AI-powered insights and predictive analytics for restaurant strategic decisions, revenue forecast, performance radar, and strategic action plans.',
};

export default function BusinessIntelligencePage() {
  return <OwnerDashboard initialNav="Business Intelligence" />;
}
