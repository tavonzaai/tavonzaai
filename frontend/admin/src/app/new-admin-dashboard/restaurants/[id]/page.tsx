import React, { Suspense } from 'react';
import NewAdminDashboard from '@/components/new-admin-dashboard/NewAdminDashboard';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  return {
    title: `Restaurant Details | Admin Console | Tavonza AI`,
    description: `Manage branches and restaurant operations for Tavonza AI Hospitality.`,
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const restaurantId = resolvedParams?.id || '';

  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
            Loading restaurant details...
          </div>
        }
      >
        <NewAdminDashboard
          initialTab="restaurants"
          initialRestaurantId={restaurantId}
        />
      </Suspense>
    </AuthGuard>
  );
}
