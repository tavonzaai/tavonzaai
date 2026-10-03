import React from 'react';
import ProfileView from '@/components/new-waiter-dashboard/profile/ProfileView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Waiter Profile | New Waiter Station | Tavonza AI',
  description: 'Waiter performance overview, shift management, personal information, and account settings.',
};

export default function NewWaiterProfilePage() {
  return <ProfileView isStandaloneRoute={true} />;
}
