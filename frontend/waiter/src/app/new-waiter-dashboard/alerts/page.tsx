import React from 'react';
import AlertsView from '@/components/new-waiter-dashboard/alerts/AlertsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Live Waiter Alerts | New Waiter Station | Tavonza AI',
  description: 'Glanceable floor notifications, order delays, and kitchen escalations.',
};

export default function NewWaiterAlertsPage() {
  return <AlertsView isStandaloneRoute={true} />;
}
