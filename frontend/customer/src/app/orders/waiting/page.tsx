'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  ChefHat,
  Utensils,
  Clock,
  Check,
  Flame,
  BellRing,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import { orderService, OrderTrackingResponse } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';

function WaitingContent() {
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

  const [orderData, setOrderData] = useState<OrderTrackingResponse | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('tavonza_last_submitted_order_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id || parsed.orderId || parsed.orderNumber)) {
            return parsed;
          }
        }
      } catch {
        // ignore parse error
      }
    }
    return null;
  });

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Sync orderId from query parameter if it changes
  useEffect(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) {
      setOrderId(fromParam);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tavonza_last_submitted_order_id', fromParam);
      }
    }
  }, [searchParams]);

  // Real-time elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Poll backend for real waiter order confirmation & updated details
  useEffect(() => {
    const trimmedId = (orderId || orderData?.orderId || orderData?.id || '').trim();
    if (!trimmedId) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const order = await orderService.getOrderDetail(trimmedId).catch(() => orderService.trackOrder(trimmedId));
        if (order && isMounted) {
          setOrderData((prev) => {
            const merged: OrderTrackingResponse = {
              ...(prev || {} as any),
              ...order,
              items: (order.items && order.items.length > 0) ? order.items : (prev?.items || []),
            };
            if (typeof window !== 'undefined') {
              localStorage.setItem('tavonza_last_submitted_order_data', JSON.stringify(merged));
              if (merged.orderNumber) {
                localStorage.setItem('tavonza_last_submitted_order_number', merged.orderNumber);
              }
            }
            return merged;
          });

          const status = String(order.status || '').toUpperCase();
          if (
            status === 'ACCEPTED' ||
            status === 'CONFIRMED' ||
            status === 'IN_PREPARATION' ||
            status === 'PREPARING' ||
            status === 'READY' ||
            status === 'SERVED'
          ) {
            router.push(`/orders/confirmed?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(trimmedId)}`);
          } else if (status === 'REJECTED' || status === 'CANCELLED') {
            router.push(`/order-unavailable?table=${encodeURIComponent(activeTable)}&reason=${status.toLowerCase()}`);
          }
        }
      } catch {
        // network or waiting for waiter: continue waiting
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    const handleRealtime = () => {
      checkStatus();
    };
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:order_item_changed', handleRealtime);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:order_item_changed', handleRealtime);
    };
  }, [orderId, orderData?.orderId, orderData?.id, activeTable, router]);

  const handleCancelOrder = () => {
    router.push(`/order-unavailable?table=${encodeURIComponent(activeTable)}&reason=cancelled`);
  };

  const displayOrderNum =
    orderData?.orderNumber ||
    (typeof window !== 'undefined' ? localStorage.getItem('tavonza_last_submitted_order_number') : null) ||
    (orderId ? (orderId.startsWith('#') ? orderId : `#${orderId.slice(0, 8)}`) : 'Queued');

  const itemsList = orderData?.items || [];
  const calculatedItemsTotal = itemsList.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const totalAmount = Number(orderData?.totalAmount || orderData?.total || calculatedItemsTotal || 0);
  const prepTime = orderData?.estimatedPrepTime || 15;

  return (
    <DesktopSplitLayout
      imageSrc="/images/seabass.jpg"
      imageAlt="Tavonza Kitchen"
      badgeText="Kitchen Queue"
      activeTable={activeTable}
      headline={
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Order Sent to Kitchen! <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Awaiting Confirmation
          </span>
        </h1>
      }
      subheadline="Our kitchen staff is reviewing your table order. Once accepted by your server, live preparation begins immediately."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Order {displayOrderNum}</span>
              <span className="text-yellow-400 text-sm font-bold font-poppins">Waiting: {secondsElapsed}s</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-medium animate-pulse">
            Queued
          </span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-5 sm:gap-6 py-2 px-1 sm:px-2">
        {/* Top Header / Back Button */}
        <header className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 text-white transition active:scale-95 cursor-pointer shadow-sm"
            title="Back to Menu"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-neutral-900/90 rounded-full border border-neutral-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-zinc-300 font-montserrat">
                Order <span className="text-yellow-400 font-bold font-mono">{displayOrderNum}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Center Content: Status & Summary */}
        <div className="flex flex-col items-center gap-4 sm:gap-5 text-center py-1">
          {/* Waiting Icon: image 59.svg with continuous smooth circular rotation */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-lg animate-pulse" />
            <Image
              src="/image 59.svg"
              alt="Waiting for waiter confirmation"
              width={96}
              height={96}
              className="w-18 h-18 sm:w-22 sm:h-22 object-contain animate-[spin_4s_linear_infinite_reverse] relative z-10"
              priority
            />
          </div>

          <div className="flex flex-col gap-1.5 max-w-xs sm:max-w-sm">
            <h1 className="text-white text-lg sm:text-2xl font-bold font-poppins tracking-wide">
              Waiting for waiter&apos;s confirmation
            </h1>
            <p className="text-[#828282] text-xs sm:text-sm font-inter font-normal leading-relaxed">
              Your order has been transmitted to the floor & kitchen. You&apos;ll be notified the second it&apos;s accepted!
            </p>
          </div>

          {/* Real-time elapsed badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs">
            <span className="text-zinc-400 font-montserrat">Elapsed wait:</span>
            <span className="text-yellow-400 font-bold font-mono text-sm">{secondsElapsed}s</span>
          </div>
        </div>

        {/* LIVE TIMELINE PROGRESS STEPPER */}
        <div className="w-full bg-[#111111] border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold font-montserrat text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              Kitchen Timeline
            </span>
            <span className="text-yellow-400 font-bold">~{prepTime} min estimated</span>
          </div>

          <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-1 text-center">
            {/* Step 1: Received */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs shadow-md shadow-yellow-500/20 animate-pulse">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-yellow-400 font-montserrat leading-tight">
                Received
              </span>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-neutral-700 text-zinc-500 flex items-center justify-center text-xs">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-500 font-montserrat leading-tight">
                Preparing
              </span>
            </div>

            {/* Step 3: Ready */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-neutral-700 text-zinc-500 flex items-center justify-center text-xs">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-500 font-montserrat leading-tight">
                Ready
              </span>
            </div>

            {/* Step 4: Served */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-neutral-700 text-zinc-500 flex items-center justify-center text-xs">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-500 font-montserrat leading-tight">
                Served
              </span>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS & ITEMIZED DISHES CARD (COMPREHENSIVE CUSTOMER ORDER BREAKDOWN) */}
        <div className="w-full bg-[#141414] border border-[#222222] rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="px-4 sm:px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-semibold font-montserrat">
                Ordered Dishes ({itemsList.length})
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
              {displayOrderNum}
            </span>
          </div>

          {/* Itemized List */}
          <div className="p-4 sm:p-5 flex flex-col divide-y divide-neutral-800/80">
            {itemsList.length > 0 ? (
              itemsList.map((item, idx) => {
                const lineTotal = Number(
                  item.lineTotal || Number(item.unitPrice || 0) * (item.quantity || 1)
                ).toFixed(2);
                const unitPrice = Number(item.unitPrice || 0).toFixed(2);

                return (
                  <div key={item.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 font-bold text-xs rounded border border-yellow-400/30 font-mono shrink-0 mt-0.5">
                          {item.quantity}x
                        </span>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-semibold font-montserrat leading-tight">
                            {item.name}
                          </span>
                          <span className="text-zinc-400 text-xs font-montserrat mt-0.5">
                            ${unitPrice} each
                          </span>
                        </div>
                      </div>
                      <span className="text-white font-bold text-sm font-poppins shrink-0">
                        ${lineTotal}
                      </span>
                    </div>

                    {/* Add-ons if present */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="ml-9 flex flex-wrap gap-1.5 pt-1">
                        {item.addOns.map((addon, aIdx) => (
                          <span
                            key={aIdx}
                            className="inline-flex items-center text-[11px] bg-neutral-900 border border-neutral-700/80 text-zinc-300 px-2 py-0.5 rounded-full font-montserrat"
                          >
                            + {addon.name} ({addon.price ? `$${Number(addon.price).toFixed(2)}` : 'Free'})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions if present */}
                    {item.specialInstructions && (
                      <div className="ml-9 mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5">
                        <span className="font-semibold text-amber-400">Note:</span>
                        <span>{item.specialInstructions}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-400">
                <ShoppingBag className="w-6 h-6 text-zinc-500" />
                <span className="text-xs font-montserrat">Loading order details...</span>
              </div>
            )}
          </div>

          {/* Pricing & Totals Section */}
          <div className="p-4 sm:p-5 bg-[#181818]/80 border-t border-[#262626] flex flex-col gap-2 text-xs font-montserrat">
            {orderData?.subtotal !== undefined && (
              <div className="flex items-center justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200 font-mono font-medium">${Number(orderData.subtotal).toFixed(2)}</span>
              </div>
            )}

            {!!orderData?.taxAmount && (
              <div className="flex items-center justify-between text-zinc-400">
                <span>Estimated Tax</span>
                <span className="text-zinc-200 font-mono font-medium">${Number(orderData.taxAmount).toFixed(2)}</span>
              </div>
            )}

            {!!orderData?.serviceCharge && (
              <div className="flex items-center justify-between text-zinc-400">
                <span>Service Charge</span>
                <span className="text-zinc-200 font-mono font-medium">${Number(orderData.serviceCharge).toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Total Amount</span>
                <span className="text-[11px] text-zinc-500">Taxes & charges included</span>
              </div>
              <span className="text-yellow-400 font-extrabold text-lg sm:text-xl font-poppins">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* METADATA INFO TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-zinc-400 font-montserrat">Estimated Prep</span>
            <span className="text-yellow-400 font-bold text-sm font-poppins flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              ~{prepTime} min
            </span>
          </div>

          <div className="p-3 bg-[#141414] border border-[#222222] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-zinc-400 font-montserrat">Table</span>
            <span className="text-white font-bold text-sm font-poppins">
              {activeTable}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-[#141414] border border-[#222222] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-zinc-400 font-montserrat">Status</span>
            <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {orderData?.displayStatus || 'Order Received'}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/orders/track?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(
                  orderId || orderData?.id || ''
                )}`
              )
            }
            className="w-full py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-sm sm:text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Track Order Live</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-[0.99] text-white text-sm font-semibold font-inter rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Add More Food</span>
          </button>

          <button
            type="button"
            onClick={handleCancelOrder}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-rose-400 hover:text-rose-300 font-medium font-inter text-xs rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function WaitingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WaitingContent />
    </Suspense>
  );
}
