'use client';

import React, { useState, useEffect } from 'react';
import { BDSHeader, BDSTabs, BDSTicketCard } from './components';
import { INITIAL_BAR_ORDERS } from './barData';
import { BarOrder, BarStatus } from './types';
import { toast } from 'sonner';

export default function BarDisplayView() {
  const [orders, setOrders] = useState<BarOrder[]>(INITIAL_BAR_ORDERS);
  const [activeStatus, setActiveStatus] = useState<BarStatus>('Queued');

  // Live timer tick for all active orders
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => ({
          ...ord,
          elapsedSeconds: ord.elapsedSeconds + 1,
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Advance bar workflow
  const handleAdvanceStatus = (order: BarOrder) => {
    if (order.status === 'Queued') {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Mixing' } : o))
      );
      toast.info(`Order ${order.id} is now Mixing at the bar`);
    } else if (order.status === 'Mixing') {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Ready' } : o))
      );
      toast.success(`Drinks for Order ${order.id} are Ready! 🍸`);
    } else if (order.status === 'Ready') {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success(`Order ${order.id} served to guest!`);
    }
  };

  const handleResetDemo = () => {
    setOrders(INITIAL_BAR_ORDERS);
    toast.success('Bar tickets reset to demo defaults');
  };

  // Filter orders for active tab
  const displayedOrders = orders.filter((o) => o.status === activeStatus);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Title, Stats & LIVE indicator */}
      <BDSHeader orders={orders} onResetDemo={handleResetDemo} />

      {/* 2. Status Segmented Tabs */}
      <BDSTabs
        orders={orders}
        activeStatus={activeStatus}
        onSelectStatus={setActiveStatus}
      />

      {/* 3. 4-Column Drink Ticket Grid */}
      {displayedOrders.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-base">No drinks currently in &quot;{activeStatus}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedOrders.map((order) => (
            <BDSTicketCard
              key={order.id}
              order={order}
              onAdvanceStatus={handleAdvanceStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
