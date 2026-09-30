'use client';

import React from 'react';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';

export default function OrdersPage() {
  return <CustomerDashboardView initialTab="orders" showAuthSuccessModal={false} />;
}
