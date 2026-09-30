'use client';

import React from 'react';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';

export default function JarvisPage() {
  return <CustomerDashboardView initialTab="jarvis" showAuthSuccessModal={false} />;
}
