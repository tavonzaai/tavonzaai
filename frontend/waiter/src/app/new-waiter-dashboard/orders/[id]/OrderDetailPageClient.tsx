'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderDetailView, { DetailViewVariation } from '@/components/new-waiter-dashboard/orders/OrderDetailView';
import { INITIAL_ORDERS } from '@/components/new-waiter-dashboard/orders/orderData';

function OrderDetailInner({ orderId }: { orderId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get('variant') || searchParams.get('variation');

  let initialVariation: DetailViewVariation | undefined = undefined;
  if (variantParam === 'addon' || variantParam === 'addon_request') initialVariation = 'addon_request';
  else if (variantParam === 'qty' || variantParam === 'quantities') initialVariation = 'quantities';
  else if (variantParam === 'cooking' || variantParam === 'cooking_ready') initialVariation = 'cooking_ready';
  else if (variantParam === 'pending') initialVariation = 'pending';

  // Find order matching ID or orderNumber, or fallback to first order
  const order =
    INITIAL_ORDERS.find(
      (o) =>
        o.orderNumber === orderId ||
        o.id.includes(orderId) ||
        o.table.toLowerCase() === orderId.toLowerCase()
    ) || INITIAL_ORDERS[0];

  return (
    <OrderDetailView
      order={order}
      initialVariation={initialVariation}
      onBack={() => router.push('/new-waiter-dashboard/orders')}
      isStandaloneRoute={true}
      onNavigateTab={(tab) => {
        if (tab === 'home' || tab === 'floor') router.push('/new-waiter-dashboard/floor');
        if (tab === 'order') router.push('/new-waiter-dashboard/orders');
        if (tab === 'jarvis') router.push('/new-waiter-dashboard/jarvis');
        if (tab === 'alert' || tab === 'alerts') router.push('/new-waiter-dashboard/alerts');
        if (tab === 'profile') router.push('/new-waiter-dashboard/profile');
      }}
    />
  );
}

export default function OrderDetailPageClient({ orderId }: { orderId: string }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OrderDetailInner orderId={orderId} />
    </Suspense>
  );
}
