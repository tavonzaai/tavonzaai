'use client';

import React, { Suspense, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Plus, Minus, Receipt } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

interface SplitItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
  owner: 'my' | 'guest';
  ownerLabel: string;
}

const DEFAULT_SPLIT_ITEMS: SplitItem[] = [
  {
    id: 'split-1',
    name: 'Potato Corn Burger',
    subtitle: 'With Sauce',
    price: 26.0,
    quantity: 4,
    image: '/images/burger.jpg',
    owner: 'my',
    ownerLabel: 'My Items',
  },
  {
    id: 'split-2',
    name: 'Potato Corn Burger',
    subtitle: 'With Sauce',
    price: 26.0,
    quantity: 4,
    image: '/images/burger.jpg',
    owner: 'guest',
    ownerLabel: 'Guest 01',
  },
];

function SplitBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 8';

  // Merge items from cart or fallback
  const initialItems: SplitItem[] = useMemo(() => {
    if (cart.length > 0) {
      const myItems: SplitItem[] = cart.map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle || 'Customized',
        price: c.price,
        quantity: c.quantity,
        image: c.image,
        owner: 'my',
        ownerLabel: 'My Items',
      }));

      const guestItem: SplitItem = {
        id: 'guest-1',
        name: 'Potato Corn Burger',
        subtitle: 'With Sauce',
        price: 26.0,
        quantity: 4,
        image: '/images/burger.jpg',
        owner: 'guest',
        ownerLabel: 'Guest 01',
      };

      return [...myItems, guestItem];
    }
    return DEFAULT_SPLIT_ITEMS;
  }, [cart]);

  const [selectedIds, setSelectedIds] = useState<string[]>(['split-1', initialItems[0]?.id].filter(Boolean));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedTotal = useMemo(() => {
    return initialItems
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [initialItems, selectedIds]);

  const handlePay = () => {
    const finalAmount = selectedTotal > 0 ? selectedTotal.toFixed(2) : '30.50';
    router.push(
      `/checkout/payment?amount=${finalAmount}&table=${encodeURIComponent(activeTable)}`
    );
  };

  const myItems = initialItems.filter((i) => i.owner === 'my');
  const guestItems = initialItems.filter((i) => i.owner === 'guest');

  return (
    <DesktopSplitLayout
      imageSrc="/images/burger.jpg"
      imageAlt="Tavonza Gourmet Split Bill"
      badgeText="Fair Table Split"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Split Dishes & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Pay Your Share
          </span>
        </h1>
      }
      subheadline="Select only the items you ordered. Split effortlessly with your table guests with zero confusion."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Your Selected Portion</span>
              <span className="text-yellow-400 text-base font-bold">${selectedTotal.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
          </span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-5">
        {/* Header: Back & Title */}
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
              Split Bill
            </h1>
          </div>

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* SECTION 1: MY ITEMS */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white text-sm font-semibold font-montserrat uppercase tracking-wider">
            My Items
          </h2>

          <div className="flex flex-col gap-3">
            {myItems.map((item) => {
              const isChecked = selectedIds.includes(item.id);
              const itemTotal = item.price * item.quantity;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full bg-[#111111] rounded-2xl border p-3 flex items-center justify-between gap-3 shadow-md cursor-pointer transition-all ${
                    isChecked ? 'border-amber-500/80 bg-neutral-900/60' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'border-stone-500 bg-transparent'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="text-white text-xs sm:text-sm font-medium font-inter truncate">
                        {item.name}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[#F0CEAB] text-[11px] font-normal font-poppins truncate">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="text-yellow-400 text-xs sm:text-sm font-semibold font-poppins">
                        ${itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400 font-inter shrink-0">
                    Qty: <span className="text-white font-medium">{item.quantity}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: GUEST ITEMS */}
        {guestItems.length > 0 && (
          <div className="flex flex-col gap-3 pt-1">
            <h2 className="text-white text-sm font-semibold font-montserrat uppercase tracking-wider">
              Guest Items
            </h2>

            <div className="flex flex-col gap-3">
              {guestItems.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                const itemTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full bg-[#111111] rounded-2xl border p-3 flex items-center justify-between gap-3 shadow-md cursor-pointer transition-all ${
                      isChecked ? 'border-amber-500/80 bg-neutral-900/60' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-black'
                            : 'border-stone-500 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <h3 className="text-white text-xs sm:text-sm font-medium font-inter truncate">
                          {item.name}
                        </h3>
                        {item.subtitle && (
                          <p className="text-[#F0CEAB] text-[11px] font-normal font-poppins truncate">
                            {item.subtitle}
                          </p>
                        )}
                        <div className="text-yellow-400 text-xs sm:text-sm font-semibold font-poppins">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-zinc-400 font-inter shrink-0">
                      Qty: <span className="text-white font-medium">{item.quantity}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePay}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-montserrat rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center cursor-pointer"
          >
            Pay Portion (${selectedTotal > 0 ? selectedTotal.toFixed(2) : '30.50'})
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function SplitBillPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SplitBillContent />
    </Suspense>
  );
}
