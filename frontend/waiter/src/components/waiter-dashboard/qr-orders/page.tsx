import React from 'react';
import WaiterDashboard from '../WaiterDashboard';

export const metadata = {
  title: 'QR Orders | Waiter Dashboard | Tavonza',
};

export default function Page() {
  return <WaiterDashboard initialNav="QR Orders" />;
}
