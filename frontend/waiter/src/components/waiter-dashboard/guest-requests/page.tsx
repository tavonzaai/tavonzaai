import React from 'react';
import WaiterDashboard from '../WaiterDashboard';

export const metadata = {
  title: 'Guest Requests | Waiter Dashboard | Tavonza',
};

export default function Page() {
  return <WaiterDashboard initialNav="Guest Requests" />;
}
