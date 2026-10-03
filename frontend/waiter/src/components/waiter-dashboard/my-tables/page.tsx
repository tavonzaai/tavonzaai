import React from 'react';
import WaiterDashboard from '../WaiterDashboard';

export const metadata = {
  title: 'My Tables | Waiter Dashboard | Tavonza',
  description: 'Floor plan and table management for assigned waiter stations.',
};

export default function Page() {
  return <WaiterDashboard initialNav="My Tables" />;
}
