'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, UtensilsCrossed, Bell, User, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { YellowSparkleIcon, FuchsiaCookingPanIcon, GreenClockIcon } from './orderIcons';
import { INITIAL_ORDERS, OrderItemData, OrderStatus } from './orderData';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';

interface OrdersListViewProps {
  onSelectOrder?: (order: OrderItemData) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenJarvis?: () => void;
  activeBottomTab?: string;
  isStandaloneRoute?: boolean;
  embedded?: boolean;
}

export default function OrdersListView({
  onSelectOrder,
  onNavigateTab,
  onOpenJarvis,
  activeBottomTab = 'order',
  isStandaloneRoute = false,
  embedded = false,
}: OrdersListViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'Active' | 'Completed'>('ALL');
  const [orders, setOrders] = useState<OrderItemData[]>(INITIAL_ORDERS);


  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    if (filter === 'Pending') return order.status === 'Pending' || order.status === 'New Add On';
    if (filter === 'Active')
      return (
        order.status === 'Ready to Serve' ||
        order.status === 'Cooking' ||
        order.status === 'Customer Calling'
      );
    if (filter === 'Completed') return order.status === 'Served';
    return true;
  });

  const actionNeededCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Ready to Serve'
  ).length;

  const handleOrderClick = (order: OrderItemData) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    } else if (isStandaloneRoute) {
      router.push(`/new-waiter-dashboard/orders/${order.orderNumber}`);
    }
  };

  const handleAcceptOrder = (orderId: string, table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrders((prev) =>
      prev.map((o) =>
        o.table === table ? { ...o, status: 'Cooking' as OrderStatus } : o
      )
    );
    toast.success(`Order accepted for ${table}! Sent to Kitchen.`, {
      description: 'Items moved to Cooking queue',
    });
  };

  const handleRejectOrder = (orderId: string, table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error(`Order for ${table} rejected`, {
      description: 'Kitchen and customer table notified',
    });
  };

  const handleMarkServed = (table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrders((prev) =>
      prev.map((o) =>
        o.table === table ? { ...o, status: 'Served' as OrderStatus } : o
      )
    );
    toast.success(`Table ${table} marked as Served! 🎉`);
  };

  const handleMarkResolved = (table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrders((prev) =>
      prev.map((o) =>
        o.table === table ? { ...o, status: 'Served' as OrderStatus } : o
      )
    );
    toast.success(`Alert for ${table} marked as Resolved!`);
  };

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <div className="h-6 px-3.5 py-1 bg-stone-800 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-amber-500 text-xs font-medium font-['Inter'] leading-4">
              Pending
            </span>
          </div>
        );
      case 'Ready to Serve':
        return (
          <div className="h-6 px-3.5 py-1 bg-green-500/10 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-green-500 text-xs font-medium font-['Inter'] leading-4">
              Ready to Serve
            </span>
          </div>
        );
      case 'Cooking':
        return (
          <div className="h-6 px-3.5 py-1 bg-fuchsia-500/10 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-fuchsia-500 text-xs font-medium font-['Inter'] leading-4">
              Cooking
            </span>
          </div>
        );
      case 'Served':
        return (
          <div className="h-6 px-3.5 py-1 bg-orange-700/10 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-orange-700 text-xs font-medium font-['Inter'] leading-4">
              Served
            </span>
          </div>
        );
      case 'New Add On':
        return (
          <div className="h-6 px-3.5 py-1 bg-blue-500/10 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-blue-500 text-xs font-medium font-['Inter'] leading-4">
              New Add On
            </span>
          </div>
        );
      case 'Customer Calling':
        return (
          <div className="h-6 px-3.5 py-1 bg-orange-700/10 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-orange-700 text-xs font-medium font-['Inter'] leading-4">
              Customer Calling
            </span>
          </div>
        );
    }
  };

  const listContent = (
    <div className="flex flex-col gap-3.5 pb-6 animate-fadeIn">
      {/* Header Title: Orders */}
      <div className="px-6 pt-3 pb-1 flex items-center justify-center relative">
        <h1 className="text-white text-xl font-medium font-['Inter'] leading-6 text-center">
          Orders
        </h1>
      </div>

      {/* Filter Bar & Action Needed Badge */}
      <div className="px-5 flex flex-col gap-3.5 mb-2">
        {/* Filter Tabs: ALL | Pending | Active | Completed */}
        <div className="w-full flex items-center gap-1.5">
          {(['ALL', 'Pending', 'Active', 'Completed'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium font-['Poppins'] transition cursor-pointer text-center outline outline-1 outline-offset-[-1px] ${
                  isActive
                    ? 'bg-yellow-400 text-zinc-900 outline-neutral-800 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-white outline-neutral-800 hover:bg-neutral-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Action Needed Badge */}
        {actionNeededCount > 0 && (
          <div className="self-start px-2 py-1 bg-red-800 rounded-sm inline-flex items-center gap-1">
            <span className="text-white text-xs font-normal font-['Poppins']">
              Action Needed ({actionNeededCount})
            </span>
          </div>
        )}
      </div>

      {/* Order Cards List */}
      <div className="px-5 flex flex-col gap-4">
        {filteredOrders.map((order) => {
          const isCustomerCalling = order.status === 'Customer Calling';
          const isPending = order.status === 'Pending';
          const isReadyToServe = order.status === 'Ready to Serve';
          const isNewAddOn = order.status === 'New Add On';

          return (
            <div
              key={`${order.table}-${order.status}`}
              onClick={() => handleOrderClick(order)}
              className={`w-full p-3 rounded-xl flex flex-col gap-4 transition duration-200 cursor-pointer ${
                isCustomerCalling
                  ? 'bg-orange-700/10 outline outline-1 outline-offset-[-1px] outline-orange-700/25 hover:outline-orange-700/50'
                  : 'bg-neutral-900 hover:bg-neutral-900/90 outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-white/15'
              }`}
            >
              <div className="flex flex-col gap-2">
                {/* Top Row: Table Box + Status Badge */}
                <div className="flex justify-between items-center">
                  <div className="w-9 h-8 bg-zinc-900 rounded-[5px] outline outline-[0.50px] outline-offset-[-0.50px] outline-zinc-300/20 flex items-center justify-center">
                    <span className="text-white text-xs font-medium font-['Inter'] leading-4">
                      {order.table}
                    </span>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                {/* Order No & Target Time */}
                <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-white text-base font-semibold font-['Montserrat']">
                    {order.id}
                  </span>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1">
                      <GreenClockIcon className="w-4 h-4" />
                      <span className="text-emerald-600 text-base font-semibold font-['Inter'] leading-5">
                        {order.time}
                      </span>
                    </div>
                    <span className="text-neutral-200 text-xs font-normal font-['Inter'] leading-4">
                      {order.targetTime}
                    </span>
                  </div>
                </div>

                {/* Order Food Items List */}
                <div className="flex flex-col gap-2 pt-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Icon type based on status */}
                        {order.status === 'Pending' || order.status === 'Ready to Serve' ? (
                          <YellowSparkleIcon className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <FuchsiaCookingPanIcon className="w-5 h-5 text-fuchsia-500" />
                        )}
                        <span className="text-stone-400 text-sm font-normal font-['Poppins']">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-white text-sm font-normal font-['Poppins']">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Amount Row */}
                <div className="pt-2 border-t-[0.80px] border-zinc-800 flex justify-between items-center">
                  <span className="text-white text-base font-semibold font-['Poppins']">
                    Total Amount
                  </span>
                  <span className="text-amber-500 text-lg font-bold font-['Poppins'] leading-5">
                    {order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Card Action Buttons matching Figma */}
              {isPending && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleRejectOrder(order.id, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={(e) => handleAcceptOrder(order.id, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-green-500 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer font-semibold shadow-sm"
                  >
                    Accept Order
                  </button>
                </div>
              )}

              {isReadyToServe && (
                <button
                  onClick={(e) => handleMarkServed(order.table, e)}
                  className="w-full h-9 bg-yellow-400 hover:bg-yellow-300 rounded-lg flex items-center justify-center text-black text-sm font-medium font-['Inter'] leading-5 transition cursor-pointer font-semibold shadow-sm"
                >
                  Mark as Served
                </button>
              )}

              {isNewAddOn && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleRejectOrder(order.id, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={(e) => handleAcceptOrder(order.id, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-green-500 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer font-semibold shadow-sm"
                  >
                    Accept Order
                  </button>
                </div>
              )}

              {isCustomerCalling && (
                <button
                  onClick={(e) => handleMarkResolved(order.table, e)}
                  className="w-full py-1.5 px-2 bg-yellow-400 hover:bg-yellow-300 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] flex items-center justify-center transition cursor-pointer font-semibold shadow-sm"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const { inShell } = useNewWaiterShell();

  if (embedded || inShell) {
    return listContent;
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      {/* Central Mobile Frame (Figma: w-96 / 384px - 420px) */}
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          {listContent}
        </div>

        {/* ──────────────── FROSTED BOTTOM DOCK WITH ACTIVE ORDER TAB ──────────────── */}
        <BottomDock
          activeTab="order"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
    </div>
  );
}
