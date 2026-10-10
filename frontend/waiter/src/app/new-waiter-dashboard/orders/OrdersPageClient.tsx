'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrdersListView from '@/components/new-waiter-dashboard/orders/OrdersListView';
import OrderDetailView from '@/components/new-waiter-dashboard/orders/OrderDetailView';
import { OrderItemData } from '@/components/new-waiter-dashboard/orders/orderData';

export default function OrdersPageClient() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<OrderItemData | null>(null);

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        isStandaloneRoute={true}
        onNavigateTab={(tab) => {
          if (tab === 'home' || tab === 'floor') router.push('/new-waiter-dashboard/home');
          if (tab === 'order') setSelectedOrder(null);
          if (tab === 'jarvis') router.push('/new-waiter-dashboard/jarvis');
          if (tab === 'alert' || tab === 'alerts') router.push('/new-waiter-dashboard/alerts');
          if (tab === 'profile') router.push('/new-waiter-dashboard/profile');
        }}
      />
    );
  }

  return (
    <OrdersListView
      onSelectOrder={(order) => setSelectedOrder(order)}
      isStandaloneRoute={true}
      activeBottomTab="order"
      onNavigateTab={(tab) => {
        if (tab === 'home' || tab === 'floor') router.push('/new-waiter-dashboard/home');
        if (tab === 'jarvis') router.push('/new-waiter-dashboard/jarvis');
        if (tab === 'alert' || tab === 'alerts') router.push('/new-waiter-dashboard/alerts');
        if (tab === 'profile') router.push('/new-waiter-dashboard/profile');
      }}
    />
  );
}
