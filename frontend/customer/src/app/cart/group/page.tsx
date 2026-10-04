'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface GuestItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
  guestName: string;
}

const INITIAL_GUEST_ITEMS: GuestItem[] = [];

function GroupCartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, updateQuantity, tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 8';

  const [guestItems, setGuestItems] = useState<GuestItem[]>(INITIAL_GUEST_ITEMS);
  const [selectAll, setSelectAll] = useState(true);

  const updateGuestQuantity = (id: string, delta: number) => {
    setGuestItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as GuestItem[]
    );
  };

  const handlePlaceOrder = () => {
    router.push(`/orders/waiting?table=${encodeURIComponent(activeTable)}&mode=together`);
  };

  return (
    <div className="w-full min-h-screen bg-[#111111] text-white relative font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85 pointer-events-none" />

      {/* Main Container - Centered and fully responsive across mobile, tablet & desktop */}
      <div className="relative z-10 w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-32 flex flex-col gap-6">
        
        {/* HEADER: Back Button & 'select all' */}
        <header className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setSelectAll(!selectAll)}
            className="text-white text-sm sm:text-base font-normal font-montserrat hover:text-yellow-400 transition cursor-pointer capitalize"
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </button>
        </header>

        {/* 2-COLUMN DESKTOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Member Items */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

            {/* SECTION 1: MY ITEMS */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-base font-medium font-montserrat">
              My Items
            </h2>
            <span className="text-xs text-zinc-400 font-montserrat">
              ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {cart.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="w-full bg-[#111111] rounded-[18px] border border-black p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md hover:border-neutral-800 transition"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[18px] overflow-hidden shrink-0 bg-neutral-900">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-white text-sm font-medium font-inter truncate">
                        {item.name}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[#F0CEAB] text-xs font-normal font-poppins tracking-wide truncate">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-0.5 text-[#CB7541] text-sm font-normal font-poppins">
                        <span>$</span>
                        <span className="text-white font-medium">{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 bg-[#E4E4E4] hover:bg-neutral-300 rounded-md backdrop-blur-sm flex items-center justify-center transition cursor-pointer text-[#373737]"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <span className="text-white text-base font-medium font-inter min-w-4 text-center">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 bg-[#FBBD08] hover:bg-yellow-400 rounded-md backdrop-blur-sm flex items-center justify-center transition cursor-pointer text-black"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: GUEST ITEMS */}
        <div className="flex flex-col gap-3.5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-base font-medium font-montserrat">
              Guest Items
            </h2>
            <span className="text-xs text-amber-400/90 font-montserrat">
              Shared Order ({activeTable})
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {guestItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="w-full bg-[#111111] rounded-[18px] border border-black p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md hover:border-neutral-800 transition"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[18px] overflow-hidden shrink-0 bg-neutral-900">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white text-sm font-medium font-inter truncate">
                          {item.name}
                        </h3>
                        <span className="text-[10px] bg-neutral-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          {item.guestName}
                        </span>
                      </div>
                      <p className="text-[#F0CEAB] text-xs font-normal font-poppins tracking-wide truncate">
                        {item.subtitle}
                      </p>
                      <div className="flex items-center gap-0.5 text-[#CB7541] text-sm font-normal font-poppins">
                        <span>$</span>
                        <span className="text-white font-medium">{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateGuestQuantity(item.id, -1)}
                      className="w-6 h-6 bg-[#E4E4E4] hover:bg-neutral-300 rounded-md backdrop-blur-sm flex items-center justify-center transition cursor-pointer text-[#373737]"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <span className="text-white text-base font-medium font-inter min-w-4 text-center">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateGuestQuantity(item.id, 1)}
                      className="w-6 h-6 bg-[#FBBD08] hover:bg-yellow-400 rounded-md backdrop-blur-sm flex items-center justify-center transition cursor-pointer text-black"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Group Summary & Action (Sticky on desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 flex flex-col gap-4">
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h2 className="text-white text-base font-semibold font-montserrat">
            Group Order Summary
          </h2>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-montserrat">
            <span>Active Table</span>
            <span className="text-white font-semibold">{activeTable}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-montserrat">
            <span>Connected Members</span>
            <span className="text-amber-400 font-semibold">2 Guests Ordering</span>
          </div>
          <div className="w-full h-px bg-neutral-800 my-1" />
          <div className="flex items-center justify-between text-sm font-semibold font-montserrat text-white">
            <span>Shared Cart Total</span>
            <span className="text-yellow-400 text-lg font-bold">
              $
              {(
                cart.reduce((s, i) => s + i.price * i.quantity, 0) +
                guestItems.reduce((s, i) => s + i.price * i.quantity, 0)
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          className="w-full py-4 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.30)] transition-all flex items-center justify-center cursor-pointer"
        >
          Place Group Order
        </button>
      </div>

    </div>

      </div>
    </div>
  );
}

export default function GroupCartPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GroupCartContent />
    </Suspense>
  );
}
