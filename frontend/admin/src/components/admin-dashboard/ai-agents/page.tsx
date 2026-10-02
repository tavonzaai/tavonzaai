import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Autonomous AI Agents',
  description: 'Autonomous AI agents that run your restaurant operations in the background.',
};

export default function AIAgentsPage() {
  return <OwnerDashboard initialNav="AI Agents" />;
}
