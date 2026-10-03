import React from 'react';
import WaiterDashboard from '../WaiterDashboard';

export const metadata = {
  title: 'Orders | Waiter Dashboard | Tavonza',
};

export default function Page() {
  return <WaiterDashboard initialNav="Orders" />;
}
