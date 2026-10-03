'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { YellowSparkleIcon, FuchsiaCookingPanIcon, GreenClockIcon } from './orderIcons';
import { OrderItemData, OrderFoodItem } from './orderData';
import BottomDock from '../navigation/BottomDock';
import { useNewWaiterShell } from '../navigation/NewWaiterShellContext';
import { toast } from 'sonner';

export type DetailViewVariation = 'pending' | 'quantities' | 'cooking_ready' | 'addon_request';

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

  // Active variation mode matching the 4 Figma designs
  const [variation, setVariation] = useState<DetailViewVariation>(() => {
    if (initialOrder?.status === 'Ready to Serve' || initialOrder?.status === 'Cooking') {
      return 'cooking_ready';
    }
    if (initialOrder?.status === 'New Add On') {
      return 'addon_request';
    }
    return initialVariation;
  });

  // Current order state
  const [currentStatus, setCurrentStatus] = useState(initialOrder?.status || 'Pending');
  const [orderNumber] = useState(initialOrder?.orderNumber || '1230');

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

  const handleAcceptOrder = () => {
    setCurrentStatus('Cooking');
    setVariation('cooking_ready');
    toast.success(`Order #${orderNumber} accepted! Sent to Kitchen.`, {
      description: 'Kitchen is now preparing the items.',
    });
  };

  const handleRejectOrder = () => {
    toast.error(`Order #${orderNumber} rejected`, {
      description: 'Notification sent to station manager.',
    });
    setTimeout(() => {
      handleBack();
    }, 1200);
  };

  const handleMarkServed = () => {
    setCurrentStatus('Served');
    toast.success(`Order #${orderNumber} marked as Served! 🎉`);
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
                onClick={() => setVariation('pending')}
                className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  variation === 'pending'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Pending
              </button>
              <button
                onClick={() => setVariation('quantities')}
                className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  variation === 'quantities'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. Selection & Qty
              </button>
              <button
                onClick={() => setVariation('cooking_ready')}
                className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  variation === 'cooking_ready'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                3. Cooking / Served
              </button>
              <button
                onClick={() => setVariation('addon_request')}
                className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  variation === 'addon_request'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                4. New Add-on
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
            <div className="h-6 px-3.5 py-1 bg-stone-800 rounded-[5px] flex justify-center items-center">
              <span className="text-center text-amber-500 text-xs font-medium font-['Inter'] leading-4">
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
            {/* If Pending or Quantities: Reject & Accept buttons */}
            {(variation === 'pending' || variation === 'quantities') && (
              <div className="w-full flex items-center gap-2 pt-1">
                <button
                  onClick={handleRejectOrder}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                >
                  Reject Order
                </button>
                <button
                  onClick={handleAcceptOrder}
                  className="flex-1 py-2.5 px-3 bg-green-500 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer font-semibold shadow-sm"
                >
                  Accept Order
                </button>
              </div>
            )}

            {/* If Cooking / Ready or Add-on view: Mark as Served */}
            {(variation === 'cooking_ready' || variation === 'addon_request') && (
              <button
                onClick={handleMarkServed}
                className="w-full h-11 bg-yellow-400 hover:bg-yellow-300 rounded-lg text-black text-sm font-medium font-['Inter'] leading-5 flex items-center justify-center transition cursor-pointer font-semibold shadow-sm"
              >
                Mark as Served
              </button>
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
