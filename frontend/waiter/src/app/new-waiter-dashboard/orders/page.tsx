import React from 'react';
import OrdersPageClient from './OrdersPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Orders | New Waiter Station | Tavonza AI',
  description: 'Live order tracking, kitchen tickets, table alerts, and guest requests.',
};

export default function NewWaiterOrdersPage() {
  return <OrdersPageClient />;
}
