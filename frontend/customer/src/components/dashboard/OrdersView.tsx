'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  Receipt,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Utensils,
  ShoppingBag,
  Flame,
  ChefHat,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { orderService, OrderListResponse, CartResponse } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';
import { useCart, resolveDynamicBranchId, resolveDynamicTableId } from '@/context/CartContext';

interface OrdersViewProps {
  onReserveClick?: () => void;
  onOpenFeedback?: (orderId?: string) => void;
}

type OrderTabFilter = 'all' | 'active' | 'history';

export default function OrdersView({ onReserveClick, onOpenFeedback }: OrdersViewProps) {
  const router = useRouter();
  const { tableNumber } = useCart();
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [activeCart, setActiveCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<OrderTabFilter>('all');

  const fetchOrdersData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const branchId = resolveDynamicBranchId();
      const tableId = resolveDynamicTableId(null, tableNumber);

      // 1. Fetch user session orders from backend GET /orders/me?branchId=...&tableId=...
      let myOrdersList: OrderListResponse[] = [];
      try {
        myOrdersList = await orderService.getMyOrders({ branchId, tableId });
      } catch (e) {
        console.warn('getMyOrders error:', e);
      }

      // 2. Also check last submitted order from local storage / cookies if not in list
      const lastId =
        typeof window !== 'undefined'
          ? (localStorage.getItem('tavonza_last_submitted_order_id') || getCookie('tavonza_last_submitted_order_id'))
          : null;

      let combined = [...(myOrdersList || [])];
      if (lastId && !combined.some((o) => o.orderId === lastId || o.id === lastId)) {
        try {
          const singleOrder = await orderService.trackOrder(lastId);
          if (singleOrder?.id) {
            combined.unshift({
              id: singleOrder.id,
              orderId: singleOrder.orderId,
              orderNumber: singleOrder.orderNumber,
              tableId: singleOrder.tableId,
              status: singleOrder.status,
              displayStatus: singleOrder.displayStatus,
              itemCount: singleOrder.items?.length || 0,
              total: singleOrder.totalAmount || singleOrder.total || 0,
              totalAmount: singleOrder.totalAmount || singleOrder.total || 0,
              estimatedPrepTime: singleOrder.estimatedPrepTime,
              items: singleOrder.items || [],
              createdAt: (singleOrder as any).submittedAt || new Date().toISOString(),
            });
          }
        } catch {
          // ignore tracking fallback
        }
      }

      setOrders(combined);

      // 3. Fetch active draft cart from GET /orders/cart
      try {
        const cart = await orderService.getCart(branchId, tableId);
        setActiveCart(cart);
      } catch {
        // ignore cart fetch error if no active session
      }
    } catch (err: any) {
      console.error('Failed to load orders from API:', err);
      setError(err.message || 'Unable to connect to orders backend service.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData(true);

    // Auto-refresh orders every 6 seconds for live kitchen progress updates
    const interval = setInterval(() => {
      fetchOrdersData(false);
    }, 6000);

    const handleRealtime = () => fetchOrdersData(false);
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:order_item_changed', handleRealtime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:order_item_changed', handleRealtime);
    };
  }, [tableNumber]);

  const activeOrders = orders.filter((o) =>
    ['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY'].includes(
      (o.status || '').toUpperCase()
    )
  );

  const pastOrders = orders.filter(
    (o) => !activeOrders.some((ao) => ao.id === o.id)
  );

  const displayedOrders =
    tabFilter === 'active'
      ? activeOrders
      : tabFilter === 'history'
      ? pastOrders
      : orders;

  const getStatusBadge = (status: string) => {
    const upper = (status || '').toUpperCase();
    switch (upper) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Submitted to Waiter
          </span>
        );
      case 'ACCEPTED':
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Confirmed by Staff
          </span>
        );
      case 'PREPARING':
      case 'IN_PREPARATION':
        return (
          <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-yellow-400 animate-pulse" />
            Preparing in Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            Ready for Table
          </span>
        );
      case 'SERVED':
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full text-xs font-medium">
            Served & Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const getTimelineSteps = (status: string) => {
    const s = (status || '').toUpperCase();
    const isSubmitted = ['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'].includes(s);
    const isConfirmed = ['ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'].includes(s);
    const isPreparing = ['IN_PREPARATION', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'].includes(s);
    const isReady = ['READY', 'SERVED', 'COMPLETED'].includes(s);

    return [
      { label: 'Order Placed', done: isSubmitted, active: s === 'SUBMITTED' },
      { label: 'Staff Confirmed', done: isConfirmed, active: s === 'ACCEPTED' || s === 'CONFIRMED' },
      { label: 'Kitchen Cooking', done: isPreparing, active: s === 'IN_PREPARATION' || s === 'PREPARING' },
      { label: 'Ready to Serve', done: isReady, active: s === 'READY' },
    ];
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans pb-28 pt-2">
      {/* 1. Header Banner */}
      <div className="w-full p-5 bg-gradient-to-br from-neutral-900 to-neutral-800/40 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
              Live Order Management
            </span>
          </div>

          <button
            onClick={() => fetchOrdersData(true)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center gap-1 text-xs cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-white font-['Inter']">
            Your Orders & Live Kitchen Tracker
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed font-['Poppins']">
            Track dishes currently preparing in the kitchen and review previous meal history in real time.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tabFilter === 'all'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setTabFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              tabFilter === 'active'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            {activeOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            Active Right Now ({activeOrders.length})
          </button>
          <button
            onClick={() => setTabFilter('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tabFilter === 'history'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            Past History ({pastOrders.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-7 px-4 sm:px-6 pt-5">
        {loading && orders.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-['Poppins']">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="w-full p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex flex-col gap-2.5 text-center">
            <span>{error}</span>
            <button
              onClick={() => fetchOrdersData(true)}
              className="self-center px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-medium transition cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* ═════════════════════════════════════════════════════════════════════ */}
            {/* 1. ACTIVE ORDERS SECTION (Current Order Right Now / In Kitchen)       */}
            {/* ═════════════════════════════════════════════════════════════════════ */}
            {tabFilter !== 'history' && activeOrders.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <h3 className="text-sm font-bold text-yellow-400 font-['Inter'] uppercase tracking-wider">
                      Current Order Right Now ({activeOrders.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-400">Kitchen Active</span>
                </div>

                <div className="flex flex-col gap-4">
                  {activeOrders.map((activeOrder) => {
                    const steps = getTimelineSteps(activeOrder.status);
                    return (
                      <div
                        key={activeOrder.id}
                        className="w-full bg-neutral-900 border border-yellow-400/50 rounded-2xl p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          {getStatusBadge(activeOrder.status)}
                          <span className="text-xs font-mono font-bold text-yellow-400">
                            Order #{activeOrder.orderNumber || activeOrder.orderId?.slice(0, 8)}
                          </span>
                        </div>

                        {/* Title & Table */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-base font-semibold text-white font-['Inter']">
                              Meal in Kitchen Preparation
                            </h4>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 font-['Inter']">
                              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              <span>Table {activeOrder.tableId || tableNumber || 'Assigned'}</span>
                            </p>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center gap-1.5 text-yellow-400 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>~{activeOrder.estimatedPrepTime || 15} mins</span>
                          </div>
                        </div>

                        {/* LIVE PROGRESS STEPPER */}
                        <div className="w-full py-2.5 px-3 bg-black/40 border border-neutral-800 rounded-xl flex flex-col gap-2">
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Live Kitchen Progress
                          </span>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            {steps.map((st, sIdx) => (
                              <div key={sIdx} className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-full h-1.5 rounded-full transition-all ${
                                    st.done
                                      ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50'
                                      : 'bg-neutral-800'
                                  }`}
                                />
                                <span
                                  className={`text-[10px] leading-tight font-medium ${
                                    st.active
                                      ? 'text-yellow-400 font-bold'
                                      : st.done
                                      ? 'text-zinc-200'
                                      : 'text-zinc-600'
                                  }`}
                                >
                                  {st.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Item summary */}
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1.5 text-xs">
                          {activeOrder.items && activeOrder.items.length > 0 ? (
                            activeOrder.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-zinc-300">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="text-white font-semibold">
                                  ${Number(item.lineTotal || 0).toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-zinc-400">
                              {activeOrder.itemCount || 1} items preparing in kitchen
                            </span>
                          )}
                        </div>

                        {/* Order total & actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
                          <span className="text-neutral-400">Total Order Amount</span>
                          <span className="text-yellow-400 font-bold text-base font-['DM_Sans']">
                            ${Number(activeOrder.totalAmount || activeOrder.total || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/orders/track?order=${encodeURIComponent(
                                  activeOrder.orderId || activeOrder.id
                                )}`
                              )
                            }
                            className="w-full sm:flex-1 h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-yellow-500/10 cursor-pointer"
                          >
                            <span>Open Full Live Tracker</span>
                            <ChevronRight className="w-4 h-4 text-black" />
                          </button>

                          <button
                            onClick={() => router.push('/menu')}
                            className="w-full sm:w-auto px-4 h-11 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition border border-neutral-700 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4 text-yellow-400" />
                            <span>Order More Food</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════ */}
            {/* 2. DRAFT CART BANNER (If customer has unsent items in cart)           */}
            {/* ═════════════════════════════════════════════════════════════════════ */}
            {activeCart && activeCart.items && activeCart.items.length > 0 && (
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Items in your cart ready to order</span>
                    <span className="text-[11px] text-zinc-400">
                      {activeCart.items.reduce((s, i) => s + i.quantity, 0)} items • $
                      {Number(activeCart.totalAmount || activeCart.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/cart')}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer shadow-md"
                >
                  View Cart
                </button>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════ */}
            {/* 3. PAST ORDER HISTORY LIST                                            */}
            {/* ═════════════════════════════════════════════════════════════════════ */}
            {tabFilter !== 'active' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-white/60 font-['Inter']">Session Records</span>
                  <h3 className="text-base font-semibold text-white font-['Inter']">
                    Previous Orders ({pastOrders.length})
                  </h3>
                </div>

                {pastOrders.length === 0 ? (
                  activeOrders.length > 0 ? (
                    <div className="w-full py-8 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center px-4">
                      <CheckCircle2 className="w-6 h-6 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-['Poppins']">
                        No previous served orders yet. Your active kitchen order is tracking above!
                      </span>
                    </div>
                  ) : (
                    <div className="w-full py-12 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-zinc-500">
                        <Receipt className="w-6 h-6 text-zinc-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-white font-['Poppins']">No Orders Found</h4>
                      <p className="text-xs text-zinc-400 max-w-xs font-['Poppins']">
                        You have not placed any orders in this session yet. Explore our fresh menu to make your selection!
                      </p>
                      <button
                        onClick={() => router.push('/menu')}
                        className="mt-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer shadow-md"
                      >
                        Browse Menu
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-3">
                    {pastOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-md"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              Order #{ord.orderNumber || ord.id.slice(0, 8)}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(ord.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {getStatusBadge(ord.status)}
                        </div>

                        {/* Items */}
                        <div className="flex flex-col gap-1 text-xs text-zinc-300">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span>
                                  {it.quantity}x {it.name}
                                </span>
                                <span className="text-white font-medium">
                                  ${Number(it.lineTotal || 0).toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-zinc-400">{ord.itemCount || 1} items</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                          <span className="text-neutral-400">Total</span>
                          <span className="text-yellow-400 font-bold text-sm font-['DM_Sans']">
                            ${Number(ord.totalAmount || ord.total || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/orders/track?order=${encodeURIComponent(ord.orderId || ord.id)}`
                              )
                            }
                            className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                          >
                            View Receipt & Details
                          </button>
                          {onOpenFeedback && (
                            <button
                              onClick={() => onOpenFeedback(ord.orderId || ord.id)}
                              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-xl transition cursor-pointer"
                            >
                              Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
