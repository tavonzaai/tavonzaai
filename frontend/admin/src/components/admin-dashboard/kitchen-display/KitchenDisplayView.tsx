'use client';

import React, { useState, useEffect } from 'react';
import { KDSHeader, KDSTabs, KDSTicketCard } from './components';
import { INITIAL_KDS_ORDERS } from './kdsData';
import { KitchenOrder, KitchenStatus } from './types';
import { toast } from 'sonner';

export default function KitchenDisplayView() {
  const [orders, setOrders] = useState<KitchenOrder[]>(INITIAL_KDS_ORDERS);
  const [activeStatus, setActiveStatus] = useState<KitchenStatus>('New Orders');
  const [liveSeconds, setLiveSeconds] = useState(134);

  // Live timer tick for all orders
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => prev + 1);
      setOrders((prevOrders) =>
        prevOrders.map((ord) => ({
          ...ord,
          elapsedSeconds: ord.elapsedSeconds + 1,
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLiveTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Move order through kitchen pipeline
  const handleAdvanceStatus = (order: KitchenOrder) => {
    if (order.status === 'New Orders') {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'In Progress' } : o))
      );
      toast.info(`Order ${order.id} is now In Preparation`);
    } else if (order.status === 'In Progress') {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Ready To Serve' } : o))
      );
      toast.success(`Order ${order.id} is Ready to Serve! 🔔`);
    } else if (order.status === 'Ready To Serve') {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success(`Order ${order.id} served successfully!`);
    }
  };

  const handleResetDemo = () => {
    setOrders(INITIAL_KDS_ORDERS);
    setLiveSeconds(134);
    toast.success('Kitchen tickets reset to demo defaults');
  };

  // Filter orders for active tab
  const displayedOrders = orders.filter((o) => o.status === activeStatus);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. KDS Header with Title, Stats & Controls */}
      <KDSHeader
        orders={orders}
        onResetDemo={handleResetDemo}
        liveTime={formatLiveTime(liveSeconds)}
      />

      {/* 2. Status Segmented Tabs */}
      <KDSTabs
        orders={orders}
        activeStatus={activeStatus}
        onSelectStatus={setActiveStatus}
      />

      {/* 3. 4-Column Ticket Cards Grid */}
      {displayedOrders.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-base">No orders currently in &quot;{activeStatus}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedOrders.map((order) => (
            <KDSTicketCard
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
