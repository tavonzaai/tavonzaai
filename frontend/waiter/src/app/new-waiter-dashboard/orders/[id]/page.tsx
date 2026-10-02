import React from 'react';
import OrderDetailPageClient from './OrderDetailPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id || '1230';
  return {
    title: `Order #${orderId} Details | New Waiter Station | Tavonza AI`,
    description: `Kitchen ticket and item details for Order #${orderId}`,
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const orderId = resolvedParams?.id || '1230';

  return <OrderDetailPageClient orderId={orderId} />;
}
