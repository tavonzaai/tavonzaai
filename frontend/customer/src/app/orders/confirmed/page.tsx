'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, ChefHat } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';
  const [orderId, setOrderId] = React.useState<string>(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) return fromParam;
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tavonza_last_submitted_order_id') || '').trim();
    }
    return '';
  });

  React.useEffect(() => {
    const fromParam = (searchParams.get('order') || searchParams.get('id') || '').trim();
    if (fromParam) {
      setOrderId(fromParam);
    }
  }, [searchParams]);

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
              <span className="text-white text-xs font-semibold font-montserrat">Estimated Wait</span>
              <span className="text-yellow-400 text-sm font-bold">15 - 20 minutes</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            Kitchen Active
          </span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-6">
        {/* Top Header / Back Button */}
        <header className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-8 h-8 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          <span className="text-xs text-zinc-400 font-montserrat">
            Status: <span className="text-emerald-400 font-semibold">Confirmed</span>
          </span>
        </header>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Success Checkmark Circle */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#22C55E] flex items-center justify-center bg-emerald-500/10 shadow-[0_0_25px_rgba(34,197,94,0.35)] animate-in zoom-in-75 duration-300">
            <Check className="w-10 h-10 text-[#22C55E] stroke-[3]" />
          </div>

          <div className="flex flex-col gap-2 max-w-sm">
            <h1 className="text-white text-xl sm:text-2xl font-medium font-poppins tracking-wide">
              Your Order Placed Successfully
            </h1>
            <p className="text-[#828282] text-xs sm:text-sm font-inter font-normal leading-relaxed">
              Your order has been sent to the kitchen. We&apos;ll notify you when it&apos;s ready.
            </p>
          </div>
        </div>

        {/* ORDER SUMMARY CARD */}
        <div className="w-full bg-[#141414] border border-[#1A1A1A] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-[#141414] border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-white text-sm font-semibold font-montserrat">
              Order Summary
            </span>
            <span className="text-white text-sm font-medium font-inter">
              {orderId}
            </span>
          </div>

          <div className="p-5 flex flex-col gap-3.5 text-sm font-montserrat">
            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-normal">Order</span>
              <span className="text-white font-semibold">{orderId}</span>
            </div>

            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-medium">Estimated Preparation</span>
              <span className="text-white font-semibold">15–20 min</span>
            </div>

            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-normal">Table Number</span>
              <span className="text-white font-semibold">{activeTable}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/orders/track?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(orderId)}`)}
            className="w-full py-4 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition-all flex items-center justify-center cursor-pointer"
          >
            Track Order
          </button>

          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-[0.99] text-white text-sm font-semibold font-inter rounded-xl transition cursor-pointer"
          >
            Back to Menu
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
