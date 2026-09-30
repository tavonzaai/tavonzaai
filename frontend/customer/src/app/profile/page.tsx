'use client';

import React from 'react';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';

export default function ProfilePage() {
  return <CustomerDashboardView initialTab="profile" showAuthSuccessModal={false} />;
}
