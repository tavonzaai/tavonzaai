import React from 'react';
import NewWaiterLandingView from '@/components/new-waiter-dashboard/NewWaiterLandingView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Floor Management | New Waiter Station | Tavonza AI',
  description: 'Interactive restaurant floor plan, table statuses, and seating layout.',
};

export default function NewWaiterFloorPage() {
  return <NewWaiterLandingView initialTab="home" />;
}
