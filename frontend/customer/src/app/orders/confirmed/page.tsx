'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Sparkles,
  ChefHat,
  Utensils,
  Clock,
  ShoppingBag,
  BellRing,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import { orderService, OrderTrackingResponse } from '@/redux/features/orderApi';
import { getCookie, setCookie } from '@/redux/api/baseApi';

function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';
  const [orderId, setOrderId] = useState<string>(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) return fromParam;
    return (getCookie('tavonza_last_submitted_order_id') || getCookie('tavonza_active_order_id') || '').trim();
  });

  const [orderData, setOrderData] = useState<OrderTrackingResponse | null>(null);

  useEffect(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) {
      setOrderId(fromParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const trimmedId = (orderId || orderData?.orderId || orderData?.id || '').trim();
    if (!trimmedId) return;

    let isMounted = true;
    const fetchOrderDetails = async () => {
      try {
        const order = await orderService.getOrderDetail(trimmedId).catch(() => orderService.trackOrder(trimmedId));
        if (order && isMounted) {
          setOrderData((prev) => {
            const merged: OrderTrackingResponse = {
              ...(prev || {} as any),
              ...order,
              items: (order.items && order.items.length > 0) ? order.items : (prev?.items || []),
            };
            if (merged.orderNumber) {
              setCookie('tavonza_last_submitted_order_number', merged.orderNumber);
            }
            return merged;
          });
        }
      } catch {
        // Continue polling
      }
    };

    fetchOrderDetails();
    const handleRealtime = () => {
      fetchOrderDetails();
    };
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:order_item_changed', handleRealtime);
    window.addEventListener('focus', handleRealtime);

    return () => {
      isMounted = false;
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:order_item_changed', handleRealtime);
      window.removeEventListener('focus', handleRealtime);
    };
  }, [orderId]);

  const displayOrderNum =
    orderData?.orderNumber ||
    getCookie('tavonza_last_submitted_order_number') ||
    (orderId ? (orderId.startsWith('#') ? orderId : `#${orderId.slice(0, 8)}`) : 'Confirmed');

  const itemsList = orderData?.items || [];
  const calculatedItemsTotal = itemsList.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const totalAmount = Number(orderData?.totalAmount || orderData?.total || calculatedItemsTotal || 0);
  const prepTime = orderData?.estimatedPrepTime || 15;

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide1.jpg"
      imageAlt="Tavonza Gourmet Order Confirmed"
      badgeText="Order Confirmed"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Order Confirmed! <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Freshly Prepared
          </span>
        </h1>
      }
      subheadline="Your order has been accepted by the kitchen staff and preparation has commenced. Track progress live on your phone."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Order {displayOrderNum}</span>
              <span className="text-yellow-400 text-sm font-bold">~{prepTime} minutes wait</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            Kitchen Active
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
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-montserrat">
              Status: <span className="text-emerald-400 font-semibold">Kitchen Accepted</span>
            </span>
          </div>
        </header>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-4 sm:gap-5 text-center">
          {/* Success Checkmark Circle */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#22C55E] flex items-center justify-center bg-emerald-500/10 shadow-[0_0_25px_rgba(34,197,94,0.35)] animate-in zoom-in-75 duration-300">
            <Check className="w-10 h-10 text-[#22C55E] stroke-[3]" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-sm">
            <h1 className="text-white text-xl sm:text-2xl font-bold font-poppins tracking-wide">
              Your Order Placed Successfully
            </h1>
            <p className="text-[#828282] text-xs sm:text-sm font-inter font-normal leading-relaxed">
              The kitchen team has accepted your order and preparation has begun.
            </p>
          </div>
        </div>

        {/* ORDER SUMMARY & ITEMIZED DISHES CARD */}
        <div className="w-full bg-[#141414] border border-[#222222] rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="px-4 sm:px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm font-semibold font-montserrat">
                Confirmed Dishes ({itemsList.length})
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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

                    {/* Add-ons */}
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

                    {/* Special Instructions */}
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
                <span className="text-xs font-montserrat">Loading order items...</span>
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
            <span className="text-[11px] text-zinc-400 font-montserrat">Estimated Wait</span>
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
            <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Kitchen Accepted
            </span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/orders/track?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(
                  orderId || orderData?.id || ''
                )}`
              )
            }
            className="w-full py-4 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Track Order Live</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-[0.99] text-white text-sm font-semibold font-inter rounded-xl transition cursor-pointer"
          >
            <span>Back to Menu</span>
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmedContent />
    </Suspense>
  );
}
