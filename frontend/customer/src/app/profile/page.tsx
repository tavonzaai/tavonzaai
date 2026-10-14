'use client';

import React, { useEffect } from 'react';
import CustomerDashboardView from '@/components/dashboard/CustomerDashboardView';

export default function ProfilePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  return <CustomerDashboardView initialTab="profile" showAuthSuccessModal={false} />;
}
