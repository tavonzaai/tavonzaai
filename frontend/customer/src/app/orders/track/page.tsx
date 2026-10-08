'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Check,
  Flame,
  Utensils,
  BellRing,
  PhoneCall,
  Sparkles,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import { orderService, OrderTrackingResponse } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';
  const [orderId, setOrderId] = useState<string>(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) return fromParam;
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('tavonza_last_submitted_order_id') ||
        getCookie('tavonza_last_submitted_order_id') ||
        ''
      ).trim();
    }
    return '';
  });

  useEffect(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) {
      setOrderId(fromParam);
    }
  }, [searchParams]);

  const [orderTracking, setOrderTracking] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callWaiterSent, setCallWaiterSent] = useState(false);

  const fetchTrackData = async () => {
    const trimmedId = (orderId || '').trim();
    if (!trimmedId) {
      setLoading(false);
      return;
    }

    try {
      const data = await orderService.trackOrder(trimmedId);
      if (data) {
        setOrderTracking(data);
      }
    } catch (err: any) {
      // Fallback: try getOrderDetail if track fails
      try {
        const detail = await orderService.getOrderDetail(trimmedId);
        if (detail) {
          setOrderTracking({
            id: detail.orderId,
            orderId: detail.orderId,
            orderNumber: detail.orderNumber,
            branchId: detail.branchId,
            tableId: detail.tableId,
            status: detail.status,
            displayStatus: detail.displayStatus,
            estimatedPrepTime: detail.estimatedPrepTime,
            items: detail.items || [],
            subtotal: detail.subtotal,
            taxAmount: detail.tax,
            serviceCharge: detail.serviceCharge,
            totalAmount: detail.total,
          });
        }
      } catch (innerErr: any) {
        console.error('Track order failed:', innerErr);
        setError(innerErr.message || 'Unable to load order tracking details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trimmedId = (orderId || '').trim();
    if (!trimmedId) {
      setLoading(false);
      return;
    }

    fetchTrackData();
    const pollTimer = setInterval(fetchTrackData, 3500);
    return () => clearInterval(pollTimer);
  }, [orderId]);

  const handleCallWaiter = () => {
    setCallWaiterSent(true);
    setTimeout(() => setCallWaiterSent(false), 4000);
  };

  const statusUpper = (orderTracking?.status || '').toUpperCase();
  const prepMinutes = orderTracking?.estimatedPrepTime || 15;

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide2.jpg"
      imageAlt="Tavonza Live Preparation"
      badgeText="Live Order Status"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Track Your Meal <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Live from Kitchen Queue
          </span>
        </h1>
      }
      subheadline="Your food is crafted fresh upon order. Stay updated in real-time as our chefs finish and plate your culinary selection."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Estimated Prep Time</span>
              <span className="text-yellow-400 text-lg font-bold font-poppins">~{prepMinutes} minutes</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium font-mono">
            {orderTracking?.displayStatus || orderTracking?.status || 'Active'}
          </span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-5">
        {/* Header: Back Button & Title */}
        <header className="w-full flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-8 h-8 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-white text-lg font-semibold font-poppins tracking-wide">
              Track Your Order
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-montserrat">
              Order #{orderTracking?.orderNumber || (orderId ? orderId.slice(0, 8) : 'Pending')}
            </span>
            <button
              onClick={fetchTrackData}
              className="p-1.5 rounded-full bg-neutral-800 text-zinc-300 hover:text-white transition"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {loading && !orderTracking ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-['Poppins']">Fetching real-time order status...</span>
          </div>
        ) : error && !orderTracking ? (
          <div className="w-full p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex flex-col gap-2 text-center my-4">
            <span>{error}</span>
            <button
              onClick={fetchTrackData}
              className="self-center px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-medium transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* ESTIMATED TIME HERO BADGE */}
            <div className="w-full flex flex-col items-center justify-center gap-1.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#FFD60A] flex items-center justify-center shadow-[0_0_20px_rgba(255,214,10,0.3)]">
                <Clock className="w-6 h-6 text-[#0B0B0B]" />
              </div>
              <span className="text-[#ECE4D1] text-[11px] uppercase font-montserrat tracking-widest font-normal">
                Estimated Time
              </span>
              <span className="text-[#FFD60A] text-2xl font-bold font-poppins">
                {prepMinutes} min
              </span>
            </div>

            {/* ORDER PROGRESS TIMELINE CARD */}
            <div className="w-full bg-[#0F0F0F] rounded-2xl border border-neutral-800/80 p-5 flex flex-col gap-1 shadow-2xl">
              {/* Timeline list from API or fallback logic */}
              {orderTracking?.timeline && orderTracking.timeline.length > 0 ? (
                orderTracking.timeline.map((step, idx) => {
                  const isDone = step.completed;
                  const isActive = step.active;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            isDone
                              ? 'bg-[#FFD60A] text-[#0B0B0B]'
                              : isActive
                              ? 'bg-amber-500 text-black animate-pulse'
                              : 'bg-neutral-900 border border-neutral-700 text-zinc-500'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isActive ? (
                            <Flame className="w-4 h-4 fill-black" />
                          ) : (
                            <Utensils className="w-3.5 h-3.5" />
                          )}
                        </div>
                        {idx < orderTracking.timeline!.length - 1 && (
                          <div
                            className={`w-0.5 h-10 my-1 ${
                              isDone ? 'bg-[#E3AC38]' : isActive ? 'bg-amber-500/50' : 'bg-white/10'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex flex-col pt-1">
                        <span
                          className={`text-sm font-semibold font-montserrat ${
                            isDone || isActive ? 'text-white' : 'text-zinc-500'
                          }`}
                        >
                          {step.step}
                        </span>
                        <span
                          className={`text-xs font-montserrat ${
                            isDone
                              ? 'text-[#787878]'
                              : isActive
                              ? 'text-[#E3AC38] font-medium'
                              : 'text-zinc-600'
                          }`}
                        >
                          {isDone ? 'Completed' : isActive ? 'In progress...' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Default Dynamic Stepper fallback */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FFD60A] flex items-center justify-center text-[#0B0B0B] shrink-0 shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="w-0.5 h-10 bg-[#E3AC38] my-1" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-white text-sm font-semibold font-montserrat">
                        Order Received
                      </span>
                      <span className="text-[#787878] text-xs font-normal font-montserrat">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[#0B0B0B] shrink-0 shadow-sm ${
                          ['ACCEPTED', 'PREPARING', 'IN_PREPARATION'].includes(statusUpper)
                            ? 'bg-[#FFD60A] animate-pulse'
                            : 'bg-neutral-800 border border-neutral-700 text-zinc-400'
                        }`}
                      >
                        <Flame className="w-4 h-4 fill-[#0B0B0B]" />
                      </div>
                      <div className="w-0.5 h-10 bg-white/30 my-1" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-[#E3AC38] text-sm font-semibold font-montserrat">
                        Preparing
                      </span>
                      <span className="text-[#E3AC38] text-xs font-medium font-montserrat">
                        {['ACCEPTED', 'PREPARING', 'IN_PREPARATION'].includes(statusUpper)
                          ? 'In Kitchen...'
                          : 'Pending Waiter Approval'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          statusUpper === 'READY'
                            ? 'bg-[#FFD60A] text-black font-bold'
                            : 'bg-neutral-900 border border-neutral-700 text-zinc-500'
                        }`}
                      >
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-0.5 h-10 bg-white/10 my-1" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-zinc-400 text-sm font-medium font-montserrat">
                        Ready to Serve
                      </span>
                      <span className="text-zinc-500 text-xs font-montserrat">
                        {statusUpper === 'READY' ? 'Plated & Ready!' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          statusUpper === 'SERVED'
                            ? 'bg-emerald-400 text-black'
                            : 'bg-neutral-900 border border-neutral-700 text-zinc-500'
                        }`}
                      >
                        <BellRing className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-zinc-400 text-sm font-medium font-montserrat">
                        Served
                      </span>
                      <span className="text-zinc-500 text-xs font-montserrat">
                        {statusUpper === 'SERVED' ? 'Enjoy your meal!' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ORDER ITEMS ITEMIZED CARD */}
            {orderTracking?.items && orderTracking.items.length > 0 && (
              <div className="w-full bg-[#141414] border border-[#1A1A1A] rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
                <span className="text-white text-sm font-semibold font-montserrat border-b border-neutral-800 pb-2">
                  Itemized Order Details
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  {orderTracking.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-zinc-300">
                      <span>
                        {it.quantity}x {it.name}
                      </span>
                      <span className="text-white font-semibold">${Number(it.lineTotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-semibold">Total Paid / Due</span>
                  <span className="text-yellow-400 font-bold text-sm font-['DM_Sans']">
                    ${Number(orderTracking.totalAmount || orderTracking.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* BOTTOM ACTION BUTTONS */}
            <div className="w-full flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
                className="w-full py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-sm sm:text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>+ Add More Food</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/checkout/payment?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(
                      orderId
                    )}`
                  )
                }
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-[0.99] text-white text-sm sm:text-base font-semibold font-inter rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Payment</span>
              </button>

              <button
                type="button"
                onClick={handleCallWaiter}
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white text-xs font-medium font-inter rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-yellow-400" />
                <span>{callWaiterSent ? 'Waiter Summoned to Table!' : 'Call Waiter to Table'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </DesktopSplitLayout>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}

