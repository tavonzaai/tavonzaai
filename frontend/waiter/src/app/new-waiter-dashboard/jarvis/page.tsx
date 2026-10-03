import React from 'react';
import JarvisCopilotView from '@/components/new-waiter-dashboard/jarvis/JarvisCopilotView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ask AI - JARVIS Copilot | New Waiter Station | Tavonza AI',
  description: 'AI-powered floor assistant, intelligent table recommendations, and real-time waiter copilot.',
};

export default function NewWaiterJarvisPage() {
  return <JarvisCopilotView isStandaloneRoute={true} />;
}
