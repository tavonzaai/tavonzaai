'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProfileView from '@/components/updated-kitchen-dashboard/ProfileView';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export default function KitchenProfilePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/updated-kitchen-dashboard/dashboard');
  };

  return (
    <AuthGuard allowedRoles={['KITCHEN']}>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
        <ProfileView onBack={handleBack} />
      </div>
    </AuthGuard>
  );
}
