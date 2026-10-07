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
} from 'lucide-react';
import { orderService, OrderListResponse, CartResponse } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';
import { useCart } from '@/context/CartContext';

interface OrdersViewProps {
  onReserveClick?: () => void;
  onOpenFeedback?: () => void;
}

export default function OrdersView({ onReserveClick, onOpenFeedback }: OrdersViewProps) {
  const router = useRouter();
  const { tableNumber } = useCart();
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [activeCart, setActiveCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawBranchId = getCookie('tavonza_branch_id');
      const branchId =
        rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)
          ? rawBranchId
          : undefined;

      // 1. Fetch user session orders from backend GET /orders/me
      const myOrdersList = await orderService.getMyOrders({ branchId });
      setOrders(myOrdersList || []);

      // 2. Fetch active draft cart from GET /orders/cart
      try {
        const cart = await orderService.getCartFromSession(branchId, tableNumber);
        setActiveCart(cart);
      } catch {
        // ignore cart fetch error if no active session
      }
    } catch (err: any) {
      console.error('Failed to load orders from API:', err);
      setError(err.message || 'Unable to connect to orders backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [tableNumber]);

  const activeSubmittedOrder = orders.find((o) =>
    ['SUBMITTED', 'ACCEPTED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARING', 'READY'].includes(
      (o.status || '').toUpperCase()
    )
  );

  const pastOrders = orders.filter((o) => o.id !== activeSubmittedOrder?.id);

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
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted by Waiter
          </span>
        );
      case 'PREPARING':
      case 'IN_PREPARATION':
        return (
          <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-yellow-400" />
            Preparing in Kitchen
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" />
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

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans pb-24 pt-2">
      {/* 1. Header Banner */}
      <div className="w-full p-5 bg-gradient-to-br from-neutral-900 to-neutral-800/20 border-b border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-semibold font-['Inter']">
              Live Order Management
            </span>
          </div>

          <button
            onClick={fetchOrdersData}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center gap-1 text-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-white font-['Inter']">
          Your Table Orders & Tracking
        </h2>

        <p className="text-xs text-neutral-400 leading-relaxed font-['Poppins']">
          Real-time backend synchronization for cart items, waiter approval status, and kitchen order progress.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-7 px-5 pt-4">
        {loading ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-['Poppins']">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="w-full p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex flex-col gap-2 text-center">
            <span>{error}</span>
            <button
              onClick={fetchOrdersData}
              className="self-center px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-medium transition"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* 2. ACTIVE SUBMITTED ORDER CARD */}
            {activeSubmittedOrder ? (
              <div className="w-full bg-neutral-900 border border-yellow-400/40 rounded-2xl p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  {getStatusBadge(activeSubmittedOrder.status)}
                  <span className="text-xs font-mono font-bold text-yellow-400">
                    Order #{activeSubmittedOrder.orderNumber || activeSubmittedOrder.orderId?.slice(0, 8)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-white font-['Inter']">
                    Current Active Meal Order
                  </h3>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 font-['Inter']">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Table {activeSubmittedOrder.tableId || tableNumber || 'Assigned'}</span>
                  </p>
                </div>

                {/* Item summary */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1.5 text-xs">
                  {activeSubmittedOrder.items && activeSubmittedOrder.items.length > 0 ? (
                    activeSubmittedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-300">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-white font-semibold">${Number(item.lineTotal || 0).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-400">
                      {activeSubmittedOrder.itemCount || 1} items in kitchen queue
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
                  <span className="text-neutral-400">Total Order Amount</span>
                  <span className="text-yellow-400 font-bold text-base font-['DM_Sans']">
                    ${Number(activeSubmittedOrder.totalAmount || activeSubmittedOrder.total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={() =>
                      router.push(
                        `/orders/track?order=${encodeURIComponent(
                          activeSubmittedOrder.orderId || activeSubmittedOrder.id
                        )}`
                      )
                    }
                    className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-yellow-500/10 cursor-pointer"
                  >
                    <span>Track Order Progress</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* 3. DRAFT CART BANNER */}
            {activeCart && activeCart.items && activeCart.items.length > 0 && !activeSubmittedOrder ? (
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Items in your cart</span>
                    <span className="text-[11px] text-zinc-400">
                      {activeCart.items.reduce((s, i) => s + i.quantity, 0)} items • $
                      {Number(activeCart.totalAmount || activeCart.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/cart')}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  View Cart
                </button>
              </div>
            ) : null}

            {/* 4. PAST ORDER HISTORY LIST */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-white/60 font-['Inter']">Session History</span>
                <h3 className="text-base font-semibold text-white font-['Inter']">Past Orders</h3>
              </div>

              {pastOrders.length === 0 && !activeSubmittedOrder ? (
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
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                              <span className="text-white font-medium">${Number(it.lineTotal || 0).toFixed(2)}</span>
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
                          View Receipt
                        </button>
                        {onOpenFeedback && (
                          <button
                            onClick={onOpenFeedback}
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
          </>
        )}
      </div>
    </div>
  );
}


