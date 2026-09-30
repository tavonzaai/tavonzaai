'use client';

import React from 'react';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';

export default function SearchPage() {
  return <CustomerDashboardView initialTab="search" showAuthSuccessModal={false} />;
}
