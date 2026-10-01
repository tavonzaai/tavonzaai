'use client';

import React, { Suspense, useState } from 'react';
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
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';
  const orderId = searchParams.get('order') || 'LT-2847';

  const [callWaiterSent, setCallWaiterSent] = useState(false);

  const handleCallWaiter = () => {
    setCallWaiterSent(true);
    setTimeout(() => setCallWaiterSent(false), 4000);
  };

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide2.jpg"
      imageAlt="Tavonza Live Preparation"
      badgeText="Live Preparation"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Track Your Meal <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Live from the Kitchen
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
              <span className="text-white text-xs font-semibold font-montserrat">Estimated Ready</span>
              <span className="text-yellow-400 text-lg font-bold font-poppins">~18 minutes</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium font-mono">
            Step 2 of 4
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

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* ESTIMATED TIME HERO BADGE */}
        <div className="w-full flex flex-col items-center justify-center gap-1.5 py-2">
          <div className="w-12 h-12 rounded-full bg-[#FFD60A] flex items-center justify-center shadow-[0_0_20px_rgba(255,214,10,0.3)]">
            <Clock className="w-6 h-6 text-[#0B0B0B]" />
          </div>
          <span className="text-[#ECE4D1] text-[11px] uppercase font-montserrat tracking-widest font-normal">
            Estimated Time
          </span>
          <span className="text-[#FFD60A] text-2xl font-bold font-poppins">
            18 min
          </span>
        </div>

        {/* ORDER PROGRESS TIMELINE CARD */}
        <div className="w-full bg-[#0F0F0F] rounded-2xl border border-neutral-800/80 p-5 flex flex-col gap-1 shadow-2xl">
          {/* Step 1: Order Received (Completed) */}
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

          {/* Step 2: Preparing (In Progress...) */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#FFD60A] flex items-center justify-center text-[#0B0B0B] shrink-0 animate-pulse shadow-sm">
                <Flame className="w-4 h-4 fill-[#0B0B0B]" />
              </div>
              <div className="w-0.5 h-10 bg-white/30 my-1" />
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-[#E3AC38] text-sm font-semibold font-montserrat">
                Preparing
              </span>
              <span className="text-[#E3AC38] text-xs font-medium font-montserrat">
                In Kitchen...
              </span>
            </div>
          </div>

          {/* Step 3: Ready to Serve */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-zinc-500 shrink-0">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <div className="w-0.5 h-10 bg-white/10 my-1" />
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-zinc-500 text-sm font-medium font-montserrat">
                Ready to Serve
              </span>
              <span className="text-zinc-600 text-xs font-montserrat">
                Pending
              </span>
            </div>
          </div>

          {/* Step 4: Delivered */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-zinc-500 shrink-0">
                <BellRing className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-zinc-500 text-sm font-medium font-montserrat">
                Delivered
              </span>
              <span className="text-zinc-600 text-xs font-montserrat">
                Pending
              </span>
            </div>
          </div>
        </div>

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
            onClick={() => router.push(`/checkout/payment?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(orderId)}`)}
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
