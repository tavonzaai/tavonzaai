'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, UtensilsCrossed, ChevronLeft } from 'lucide-react';
import { YellowSparkleIcon, FuchsiaCookingPanIcon, GreenClockIcon } from './orderIcons';
import { OrderItemData, OrderStatus } from './orderData';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { waiterService, getActiveBranchId, WaiterOrderSummary } from '@/redux/features/waiterApi';
import { toast } from 'sonner';

interface OrdersListViewProps {
  onSelectOrder?: (order: OrderItemData) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenJarvis?: () => void;
  activeBottomTab?: string;
  isStandaloneRoute?: boolean;
  embedded?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function OrdersListView({
  onSelectOrder,
  onNavigateTab,
  onOpenJarvis,
  activeBottomTab = 'order',
  isStandaloneRoute = false,
  embedded = false,
  showBackButton = false,
  onBack,
}: OrdersListViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'Active' | 'Completed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const mapBackendStatus = (backendStatus: string): OrderStatus => {
    switch (backendStatus?.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'Cooking';
      case 'READY':
        return 'Ready to Serve';
      case 'SERVED':
      case 'COMPLETED':
        return 'Served';
      default:
        return 'Pending';
    }
  };

  const prevPendingIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const branchId = getActiveBranchId();
      let statusParam: string | undefined = undefined;
      if (filter === 'Pending') statusParam = 'PENDING';
      if (filter === 'Active') statusParam = 'CONFIRMED,PREPARING,READY';
      if (filter === 'Completed') statusParam = 'SERVED,COMPLETED';

      const backendOrders = await waiterService.queryOrders({
        branchId,
        status: statusParam,
        search: searchQuery.trim() || undefined,
      });

      // Detect newly arrived customer orders
      const currentPending = backendOrders.filter((bo: any) => bo.status?.toUpperCase() === 'PENDING');
      const currentPendingIds = new Set(currentPending.map((bo: any) => bo.id || bo.orderId));

      if (!isInitialLoadRef.current) {
        const newlyArrived = currentPending.filter((bo: any) => !prevPendingIdsRef.current.has(bo.id || bo.orderId));
        const latest = newlyArrived[0];
        if (latest) {
          const tbl = latest.tableLabel || latest.tableNumber || 'Table';
          const num = latest.orderNumber || (latest.id ? latest.id.slice(0, 5) : 'New');
          toast.info(`🔔 New order #${num} arrived for ${tbl}!`, {
            duration: 6000,
          });
        }
      }
      isInitialLoadRef.current = false;
      prevPendingIdsRef.current = currentPendingIds;

      const mapped: OrderItemData[] = backendOrders.map((bo: WaiterOrderSummary) => {
        const orderNumber = bo.orderNumber || (bo.id ? bo.id.slice(0, 8) : 'ORD');
        const displayStatus = mapBackendStatus(bo.status);
        const placed = bo.placedAt ? new Date(bo.placedAt) : new Date();
        const timeStr = !isNaN(placed.getTime())
          ? placed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '10:00';

        const items = Array.isArray(bo.items) && bo.items.length > 0
          ? bo.items.map((it: any, idx: number) => ({
              id: it.id || `it-${idx}`,
              name: it.productName || it.name || 'Menu Dish',
              subtitle: '',
              price: `$${Number(it.unitPrice || 0).toFixed(2)}`,
              priceNum: Number(it.unitPrice || 0),
              quantity: it.quantity || 1,
              image: '/images/burger.jpg',
              iconType: (displayStatus === 'Ready to Serve' ? 'ready' : displayStatus === 'Cooking' ? 'cooking' : 'sparkle') as any,
            }))
          : [
              {
                id: 'item-default',
                name: `${bo.itemsCount || 1} Item(s)`,
                subtitle: '',
                price: `$${Number(bo.totalAmount || bo.total || 0).toFixed(2)}`,
                priceNum: Number(bo.totalAmount || bo.total || 0),
                quantity: bo.itemsCount || 1,
                image: '/images/burger.jpg',
                iconType: 'sparkle' as any,
              },
            ];

        return {
          id: orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`,
          orderNumber: orderNumber.replace(/^#+/, ''),
          realId: bo.id || bo.orderId,
          table: bo.tableLabel || bo.tableNumber || 'Table',
          status: displayStatus,
          time: timeStr,
          targetTime: displayStatus === 'Served' ? 'Completed' : 'Target 15min',
          items,
          subtotal: `$${Number(bo.totalAmount || bo.total || 0).toFixed(2)}`,
          serviceCharge: '$0.00',
          tax: '$0.00',
          totalAmount: `$${Number(bo.totalAmount || bo.total || 0).toFixed(2)}`,
          specialInstructions: bo.specialInstructions || undefined,
        };
      });

      setOrders(mapped);
    } catch (err: any) {
      console.error('Failed to fetch waiter orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();

    // Auto-refresh every 3 seconds for real-time live customer order updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

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

  const handleAcceptOrder = async (orderId: string, table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await waiterService.acceptOrder(orderId);
      toast.success(`Order accepted for ${table}! Sent to Kitchen.`);
      await fetchOrders();
    } catch (err: any) {
      toast.error(`Failed to accept order: ${err.message || 'Error occurred'}`);
    }
  };

  const handleRejectOrder = async (orderId: string, table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await waiterService.rejectOrder({
        orderId,
        reason: 'Kitchen capacity reached',
        reasonCode: 'KITCHEN_CAPACITY',
      });
      toast.success(`Order for ${table} rejected.`);
      await fetchOrders();
    } catch (err: any) {
      toast.error(`Failed to reject order: ${err.message || 'Error occurred'}`);
    }
  };

  const handleMarkServed = async (orderId: string, table: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await waiterService.serveOrder(orderId);
      toast.success(`Table ${table} marked as Served! 🎉`);
      await fetchOrders();
    } catch (err: any) {
      toast.error(`Failed to mark served: ${err.message || 'Error occurred'}`);
    }
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
      default:
        return (
          <div className="h-6 px-3.5 py-1 bg-stone-800 rounded-[5px] flex justify-center items-center">
            <span className="text-center text-amber-500 text-xs font-medium font-['Inter'] leading-4">
              {status}
            </span>
          </div>
        );
    }
  };

  const listContent = (
    <div className="flex flex-col gap-3.5 pb-6 animate-fadeIn">
      {/* Header Title: Orders */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between relative">
        {showBackButton && onBack ? (
          <button
            onClick={onBack}
            className="w-7 h-7 bg-neutral-900 hover:bg-neutral-800 rounded-full flex justify-center items-center cursor-pointer transition border border-white/10 text-amber-400"
            title="Back to Floor"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <h1 className="text-white text-xl font-medium font-['Inter'] leading-6 text-center">
          Orders
        </h1>
        <div className="w-7" />
      </div>

      {/* Backend Real-time Search Input */}
      <div className="px-5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or table..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400/50 transition"
          />
        </div>
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

      {/* Loading state */}
      {loading && orders.length === 0 && (
        <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
          <span className="text-xs text-zinc-400">Loading orders...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-white font-medium">No orders found</p>
          <p className="text-xs text-zinc-400">
            {searchQuery ? `No orders matching "${searchQuery}"` : `No orders in "${filter}" status right now.`}
          </p>
        </div>
      )}

      {/* Order Cards List */}
      <div className="px-5 flex flex-col gap-4">
        {orders.map((order) => {
          const isPending = order.status === 'Pending';
          const isReadyToServe = order.status === 'Ready to Serve';

          return (
            <div
              key={`${order.realId || order.id}`}
              onClick={() => handleOrderClick(order)}
              className="w-full p-3 rounded-xl flex flex-col gap-4 transition duration-200 cursor-pointer bg-neutral-900 hover:bg-neutral-900/90 outline outline-1 outline-offset-[-1px] outline-white/5 hover:outline-white/15"
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

              {/* Card Action Buttons: Real Backend Mutations */}
              {isPending && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleRejectOrder(order.realId || order.orderNumber, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={(e) => handleAcceptOrder(order.realId || order.orderNumber, order.table, e)}
                    className="flex-1 py-1.5 px-2 bg-green-500 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer font-semibold shadow-sm"
                  >
                    Accept Order
                  </button>
                </div>
              )}

              {isReadyToServe && (
                <button
                  onClick={(e) => handleMarkServed(order.realId || order.orderNumber, order.table, e)}
                  className="w-full h-9 bg-yellow-400 hover:bg-yellow-300 rounded-lg flex items-center justify-center text-black text-sm font-medium font-['Inter'] leading-5 transition cursor-pointer font-semibold shadow-sm"
                >
                  Mark as Served
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
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          {listContent}
        </div>
        <BottomDock
          activeTab="order"
          onNavigateTab={onNavigateTab}
          showFloorLabel={true}
        />
      </div>
    </div>
  );
}
