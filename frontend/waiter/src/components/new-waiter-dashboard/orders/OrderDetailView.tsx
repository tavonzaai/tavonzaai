'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Home,
  UtensilsCrossed,
  Bell,
  User,
  Minus,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { YellowSparkleIcon, FuchsiaCookingPanIcon, GreenClockIcon } from './orderIcons';
import { OrderItemData, OrderFoodItem, OrderStatus } from './orderData';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';
import { waiterService } from '@/redux/features/waiterApi';
import { baseApiFetch } from '@/redux/api/baseApi';

export type DetailViewVariation = 'pending' | 'quantities' | 'cooking_ready' | 'addon_request' | 'served';

interface OrderDetailViewProps {
  order?: OrderItemData;
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenJarvis?: () => void;
  initialVariation?: DetailViewVariation;
  isStandaloneRoute?: boolean;
  embedded?: boolean;
}

export default function OrderDetailView({
  order: initialOrder,
  onBack,
  onNavigateTab,
  onOpenJarvis,
  initialVariation = 'pending',
  isStandaloneRoute = false,
  embedded = false,
}: OrderDetailViewProps) {
  const router = useRouter();

  // Active variation mode matching the Figma designs
  const [variation, setVariation] = useState<DetailViewVariation>(() => {
    if (initialOrder?.status === 'Served') {
      return 'served';
    }
    if (initialOrder?.status === 'Ready to Serve' || initialOrder?.status === 'Cooking') {
      return 'cooking_ready';
    }
    if (initialOrder?.status === 'New Add On') {
      return 'addon_request';
    }
    return initialVariation;
  });

  // Current order state
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrder?.status || 'Pending');
  const [orderNumber] = useState(initialOrder?.orderNumber || '1230');

  // Synchronize state when initialOrder changes
  useEffect(() => {
    if (initialOrder?.status) {
      setCurrentStatus(initialOrder.status);
      if (initialOrder.status === 'Served') {
        setVariation('served');
      } else if (initialOrder.status === 'Ready to Serve' || initialOrder.status === 'Cooking') {
        setVariation('cooking_ready');
      } else if (initialOrder.status === 'New Add On') {
        setVariation('addon_request');
      } else {
        setVariation('pending');
      }
    }
  }, [initialOrder]);

  // Quantities & selection for interactive demo
  const [item1Qty, setItem1Qty] = useState(4);
  const [item2Qty, setItem2Qty] = useState(4);
  const [item1Checked, setItem1Checked] = useState(true);
  const [item2Checked, setItem2Checked] = useState(false);

  // Add-on card state
  const [addonAccepted, setAddonAccepted] = useState(false);
  const [addonRejected, setAddonRejected] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (isStandaloneRoute) {
      router.push('/new-waiter-dashboard/orders');
    } else {
      router.back();
    }
  };

  const handleAcceptOrder = async () => {
    try {
      if (initialOrder?.realId) {
        await waiterService.acceptOrder(initialOrder.realId);
      }
      setCurrentStatus('Cooking');
      setVariation('cooking_ready');
      toast.success(`Order #${orderNumber} accepted! Sent to Kitchen.`, {
        description: 'Kitchen is now preparing the items.',
      });
    } catch (err: any) {
      toast.error(`Failed to accept order: ${err.message || 'Error occurred'}`);
    }
  };

  const handleRejectOrder = async () => {
    try {
      if (initialOrder?.realId) {
        await waiterService.rejectOrder({
          orderId: initialOrder.realId,
          reason: 'Rejected by floor waiter',
          reasonCode: 'OTHER',
        });
      }
      toast.error(`Order #${orderNumber} rejected`, {
        description: 'Notification sent to station manager.',
      });
      setTimeout(() => {
        handleBack();
      }, 1000);
    } catch (err: any) {
      toast.error(`Failed to reject order: ${err.message || 'Error occurred'}`);
    }
  };

  const handleMarkServed = async () => {
    if (currentStatus === 'Cooking') {
      toast.warning(`Order #${orderNumber} is currently cooking in the kitchen! Please wait until the kitchen marks it "Ready to Serve".`, {
        duration: 4000,
      });
      return;
    }
    try {
      if (initialOrder?.realId) {
        await waiterService.serveOrder(initialOrder.realId);
      }
      setCurrentStatus('Served');
      setVariation('served');
      toast.success(`Order #${orderNumber} marked as Served! 🎉`);
    } catch (err: any) {
      toast.error(`Failed to mark served: ${err.message || 'Error occurred'}`);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      if (initialOrder?.realId) {
        await baseApiFetch(`/orders/${encodeURIComponent(initialOrder.realId)}`, {
          method: 'DELETE',
        }).catch(() => null);
      }
      toast.success(`Order #${orderNumber} deleted/dismissed.`);
      setTimeout(() => {
        handleBack();
      }, 500);
    } catch (err: any) {
      toast.error(`Failed to delete order: ${err.message || 'Error occurred'}`);
    }
  };

  const handleAcceptAddon = () => {
    setAddonAccepted(true);
    toast.success('New Add-on accepted for Table T5! Added to ticket.');
  };

  const handleRejectAddon = () => {
    setAddonRejected(true);
    toast.error('Add-on request rejected');
  };

  // Dynamic calculations based on quantities
  const totalItemCount = item1Qty + item2Qty;
  const baseSubtotal = 28.30 * (totalItemCount / 8);
  const serviceCharge = baseSubtotal * 0.05;
  const tax = baseSubtotal * 0.08;
  const totalAmount = (104.0 * (totalItemCount / 8)).toFixed(2);

  const detailContent = (
    <div className="flex flex-col gap-3 pb-6 animate-fadeIn">
      {/* Quick Variation Switcher Bar */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setVariation('pending');
              setCurrentStatus('Pending');
            }}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
              variation === 'pending'
                ? 'bg-yellow-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Pending
          </button>
          <button
            onClick={() => {
              setVariation('quantities');
              setCurrentStatus('Pending');
            }}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
              variation === 'quantities'
                ? 'bg-yellow-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Selection &amp; Qty
          </button>
          <button
            onClick={() => {
              setVariation('cooking_ready');
              if (currentStatus === 'Served' || currentStatus === 'Pending') {
                setCurrentStatus('Cooking');
              }
            }}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
              variation === 'cooking_ready'
                ? 'bg-yellow-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3. Cooking / Ready
          </button>
          <button
            onClick={() => {
              setVariation('served');
              setCurrentStatus('Served');
            }}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
              variation === 'served'
                ? 'bg-yellow-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            4. Served
          </button>
          <button
            onClick={() => {
              setVariation('addon_request');
              setCurrentStatus('New Add On');
            }}
            className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
              variation === 'addon_request'
                ? 'bg-yellow-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            5. New Add-on
          </button>
        </div>
      </div>

      {/* Header Row: Back Button + Order No #1230 + Status Badge */}
      <div className="px-5 pt-3 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-7 h-7 p-1 bg-neutral-900 hover:bg-neutral-800 rounded-full flex justify-center items-center cursor-pointer transition border border-white/10"
            title="Back to Orders"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-white text-base font-semibold font-['Montserrat']">
            Oder No #{orderNumber}
          </h1>
        </div>

        {/* Status Badge */}
        <div
          className={`h-6 px-3.5 py-1 rounded-[5px] flex justify-center items-center ${
            currentStatus === 'Served'
              ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30'
              : currentStatus === 'Ready to Serve'
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : currentStatus === 'Cooking'
              ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30'
              : 'bg-stone-800 text-amber-500 border border-amber-500/20'
          }`}
        >
          <span className="text-center text-xs font-medium font-['Inter'] leading-4">
            {currentStatus}
          </span>
        </div>
      </div>

          {/* Order Details Body */}
          <div className="px-5 flex flex-col gap-5">
            
            {/* ──────────────── ITEM 1 ──────────────── */}
            <div className="flex flex-col gap-1.5">
              {/* Optional Selection Checkbox (Variation 2) */}
              {variation === 'quantities' && (
                <div
                  onClick={() => setItem1Checked(!item1Checked)}
                  className="flex items-center gap-2 cursor-pointer select-none mb-0.5"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                      item1Checked
                        ? 'bg-blue-600 text-white'
                        : 'border border-neutral-600 bg-neutral-900'
                    }`}
                  >
                    {item1Checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              )}

              {/* Item Card 1 */}
              <div className="w-full pr-4 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-black flex justify-between items-center p-1">
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-800">
                    <Image
                      src="/images/burger.jpg"
                      alt="Potato Corn Burger"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 justify-center">
                    <span className="text-white text-sm font-medium font-['Inter']">
                      Potato Corn Burger
                    </span>
                    <span className="text-orange-200 text-xs font-normal font-['Poppins'] tracking-wide">
                      With Sauce
                    </span>
                    {/* Price tag in variation 2 */}
                    {variation === 'quantities' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-orange-400 text-sm font-normal font-['Poppins'] tracking-wide">
                          $
                        </span>
                        <span className="text-white text-sm font-normal font-['Poppins'] tracking-wide">
                          104.00
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Icon / Controls depending on variation */}
                {variation === 'pending' && (
                  <YellowSparkleIcon className="w-6 h-6 text-yellow-400" />
                )}

                {variation === 'quantities' && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setItem1Qty(Math.max(1, item1Qty - 1))}
                      className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded-md flex items-center justify-center cursor-pointer transition"
                    >
                      <Minus className="w-3 h-3 text-neutral-700 stroke-[3]" />
                    </button>
                    <span className="text-white text-base font-medium font-['Inter'] min-w-[12px] text-center">
                      {item1Qty}
                    </span>
                    <button
                      onClick={() => setItem1Qty(item1Qty + 1)}
                      className="w-6 h-6 bg-yellow-500 hover:bg-yellow-400 rounded-md flex items-center justify-center cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </button>
                  </div>
                )}

                {(variation === 'cooking_ready' || variation === 'addon_request') && (
                  <FuchsiaCookingPanIcon className="w-6 h-6 text-fuchsia-500" />
                )}
              </div>
            </div>

            {/* ──────────────── ITEM 2 ──────────────── */}
            <div className="flex flex-col gap-1.5">
              {/* Optional Selection Checkbox (Variation 2) */}
              {variation === 'quantities' && (
                <div
                  onClick={() => setItem2Checked(!item2Checked)}
                  className="flex items-center gap-2 cursor-pointer select-none mb-0.5"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                      item2Checked
                        ? 'bg-blue-600 text-white'
                        : 'border border-neutral-600 bg-neutral-900'
                    }`}
                  >
                    {item2Checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              )}

              {/* Item Card 2 */}
              <div className="w-full pr-4 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-black flex justify-between items-center p-1">
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-800">
                    <Image
                      src="/images/burger.jpg"
                      alt="Potato Corn Burger"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 justify-center">
                    <span className="text-white text-sm font-medium font-['Inter']">
                      Potato Corn Burger
                    </span>
                    <span className="text-orange-200 text-xs font-normal font-['Poppins'] tracking-wide">
                      With Sauce
                    </span>
                    {/* Price tag in variation 2 */}
                    {variation === 'quantities' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-orange-400 text-sm font-normal font-['Poppins'] tracking-wide">
                          $
                        </span>
                        <span className="text-white text-sm font-normal font-['Poppins'] tracking-wide">
                          104.00
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Icon / Controls */}
                {variation === 'pending' && (
                  <YellowSparkleIcon className="w-6 h-6 text-yellow-400" />
                )}

                {variation === 'quantities' && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setItem2Qty(Math.max(1, item2Qty - 1))}
                      className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 rounded-md flex items-center justify-center cursor-pointer transition"
                    >
                      <Minus className="w-3 h-3 text-neutral-700 stroke-[3]" />
                    </button>
                    <span className="text-white text-base font-medium font-['Inter'] min-w-[12px] text-center">
                      {item2Qty}
                    </span>
                    <button
                      onClick={() => setItem2Qty(item2Qty + 1)}
                      className="w-6 h-6 bg-yellow-500 hover:bg-yellow-400 rounded-md flex items-center justify-center cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </button>
                  </div>
                )}

                {(variation === 'cooking_ready' || variation === 'addon_request') && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* ──────────────── ORDER SUMMARY CARD ──────────────── */}
            <div className="w-full bg-neutral-900 rounded-[10px] p-4 flex flex-col gap-3">
              <h3 className="text-white text-base font-semibold font-['Montserrat']">
                Order Summary
              </h3>

              <div className="flex flex-col gap-2 text-sm font-normal font-['Montserrat']">
                {/* Burger line */}
                <div className="flex justify-between items-center text-white">
                  <span>Potato Corn Burger</span>
                  <span className="font-['Montserrat']">
                    {String(item1Qty).padStart(2, '0')}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-white">
                  <span>Subtotal</span>
                  <span>${baseSubtotal.toFixed(2)}</span>
                </div>

                {/* Service Charge */}
                <div className="flex justify-between items-center text-white">
                  <span>Service Charge ( 5% )</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center text-white">
                  <span>Tax ( 8% )</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Amount Divider & Row */}
              <div className="pt-3 border-t border-neutral-400/25 flex justify-between items-center mt-1">
                <span className="text-white text-base font-semibold font-['Montserrat']">
                  Total Amount
                </span>
                <span className="text-yellow-400 text-lg font-bold font-['Poppins'] leading-5">
                  ${totalAmount}
                </span>
              </div>
            </div>

            {/* ──────────────── SPECIAL INSTRUCTIONS ──────────────── */}
            <div className="flex flex-col gap-2">
              <span className="text-white text-sm font-medium font-['Inter']">
                Special Instructions
              </span>
              <div className="p-3.5 bg-amber-500/10 rounded-[10px] border border-amber-500/20">
                <p className="text-amber-500 text-sm font-normal font-['Inter'] leading-5">
                  Add any special requests for your food, such as less spicy, no onions, extra
                  sauce, or less salt.
                </p>
              </div>
            </div>

            {/* ──────────────── ACTION BUTTONS ──────────────── */}
            {/* Case 1: If Served -> NEVER show Accept or Serve. ONLY show Served badge + Delete Order button */}
            {(currentStatus === 'Served' || variation === 'served') && (
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <div className="w-full py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold font-['Inter']">
                    Order Served &amp; Completed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  className="w-full h-11 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-xl text-red-400 text-sm font-medium font-['Inter'] flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete / Dismiss Order</span>
                </button>
              </div>
            )}

            {/* Case 2: If Pending or Quantities: Reject & Accept buttons (ONLY when not served) */}
            {currentStatus !== 'Served' && variation !== 'served' && (variation === 'pending' || variation === 'quantities') && (
              <div className="w-full flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRejectOrder}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                >
                  Reject Order
                </button>
                <button
                  type="button"
                  onClick={handleAcceptOrder}
                  className="flex-1 py-2.5 px-3 bg-green-500 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-semibold font-['Poppins'] hover:bg-green-400 transition cursor-pointer shadow-sm"
                >
                  Accept Order
                </button>
              </div>
            )}

            {/* Case 3: If Cooking or Ready to Serve (ONLY when not served) */}
            {currentStatus !== 'Served' && variation !== 'served' && (variation === 'cooking_ready' || variation === 'addon_request') && (
              currentStatus === 'Ready to Serve' ? (
                <button
                  type="button"
                  onClick={handleMarkServed}
                  className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 rounded-lg text-black text-sm font-semibold font-['Inter'] leading-5 flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Mark as Served</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast.warning(`Order #${orderNumber} is currently cooking in the kitchen! Please wait until the kitchen marks it "Ready to Serve".`, {
                      duration: 4000,
                    });
                  }}
                  className="w-full h-11 bg-neutral-800/80 border border-neutral-700/80 rounded-lg text-zinc-400 text-xs sm:text-sm font-medium font-['Inter'] leading-5 flex items-center justify-center gap-2 cursor-not-allowed transition hover:bg-neutral-800"
                  title="Food is cooking in the kitchen. Cannot serve yet."
                >
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                  <span>Cooking in Kitchen (Not Ready to Serve)</span>
                </button>
              )
            )}

            {/* ──────────────── NEW ADD-ON REQUEST SECTION (VARIATION 4) ──────────────── */}
            {variation === 'addon_request' && !addonRejected && (
              <div className="w-full flex flex-col gap-3 pt-3 pb-2 animate-fadeIn">
                <h3 className="text-white text-base font-semibold font-['Montserrat'] text-center">
                  New Add-on Request
                </h3>

                <div className="w-full p-3 bg-neutral-900 rounded-xl border border-blue-500/30 flex flex-col gap-4 shadow-lg shadow-blue-500/5">
                  <div className="flex flex-col gap-2">
                    {/* Top Row: Table T5 + Status Badge New Add On */}
                    <div className="flex justify-between items-center">
                      <div className="w-9 h-8 bg-zinc-900 rounded-[5px] outline outline-[0.50px] outline-offset-[-0.50px] outline-zinc-300/20 flex items-center justify-center">
                        <span className="text-white text-xs font-medium font-['Inter'] leading-4">
                          T5
                        </span>
                      </div>
                      <div className="h-6 px-3.5 py-1 bg-blue-500/20 rounded-[10px] flex justify-center items-center">
                        <span className="text-center text-blue-500 text-xs font-normal font-['Inter']">
                          New Add On
                        </span>
                      </div>
                    </div>

                    {/* Order No & Target Time */}
                    <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                      <span className="text-white text-base font-semibold font-['Montserrat']">
                        Oder No #1230
                      </span>
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                          <GreenClockIcon className="w-4 h-4" />
                          <span className="text-emerald-600 text-base font-semibold font-['Inter'] leading-5">
                            10:24
                          </span>
                        </div>
                        <span className="text-neutral-200 text-xs font-normal font-['Inter'] leading-4">
                          Target 12min
                        </span>
                      </div>
                    </div>

                    {/* Add-on items */}
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FuchsiaCookingPanIcon className="w-5 h-5 text-fuchsia-500" />
                          <span className="text-stone-400 text-sm font-normal font-['Poppins']">
                            Potato Corn Burger
                          </span>
                        </div>
                        <span className="text-white text-sm font-normal font-['Poppins']">
                          $168.00
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FuchsiaCookingPanIcon className="w-5 h-5 text-fuchsia-500" />
                          <span className="text-stone-400 text-sm font-normal font-['Poppins']">
                            Potato Corn Burger
                          </span>
                        </div>
                        <span className="text-white text-sm font-normal font-['Poppins']">
                          $168.00
                        </span>
                      </div>
                    </div>

                    {/* Total Amount Row */}
                    <div className="pt-2 border-t-[0.80px] border-zinc-800 flex justify-between items-center">
                      <span className="text-white text-base font-semibold font-['Poppins']">
                        Total Amount
                      </span>
                      <span className="text-amber-500 text-lg font-bold font-['Poppins'] leading-5">
                        $193.20
                      </span>
                    </div>
                  </div>

                  {/* Add-on action buttons */}
                  {!addonAccepted ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleRejectAddon}
                        className="flex-1 py-1.5 px-2 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                      >
                        Reject Order
                      </button>
                      <button
                        onClick={handleAcceptAddon}
                        className="flex-1 py-1.5 px-2 bg-green-500 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer font-semibold"
                      >
                        Accept Order
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-green-500/10 rounded-md border border-green-500/30 text-green-400 text-center text-xs font-medium">
                      ✓ Add-on Confirmed & Dispatched to Kitchen
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
  );

  const { inShell } = useNewWaiterShell();

  if (embedded || inShell) {
    return detailContent;
  }

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      {/* Central Mobile Frame (Figma: w-96 / 384px - 420px) */}
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative">
          {detailContent}
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
