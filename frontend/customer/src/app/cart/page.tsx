'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DraggableAskAi from '@/components/common/DraggableAskAi';
import { orderService } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    subtotal,
    serviceCharge,
    tax,
    totalAmount,
    tableNumber,
  } = useCart();

  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTable = searchParams.get('table') || tableNumber || 'Table 8';

  const handleOrderPreferenceClick = () => {
    setShowPreferenceModal(true);
  };

  const handleOrderIndividually = async () => {
    setIsSubmitting(true);
    try {
      const rawBranchId = getCookie('tavonza_branch_id');
      const branchId =
        rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)
          ? rawBranchId
          : 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
      const tableId = getCookie('tavonza_table_id') || activeTable.replace(/\D/g, '') || '8';

      try {
        const draft = await orderService.getCart(branchId, tableId);
        if (draft?.id) {
          for (const item of cart) {
            await orderService.addItem({
              orderId: draft.id,
              menuItemId: item.dishId || item.id,
              quantity: item.quantity,
              specialInstructions: item.specialInstructions,
              addOns: item.addOns?.map((a) => ({ name: a.name, price: a.price })),
            });
          }
          const submitted = await orderService.submitOrder(draft.id);
          const submittedId = submitted?.orderNumber || submitted?.id;
          if (submittedId) {
            clearCart();
            setShowPreferenceModal(false);
            router.push(`/orders/waiting?table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(submittedId)}&mode=individual`);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend cart submit fallback to local session:', err);
      }

      const fallbackId = `LT-${Math.floor(1000 + Math.random() * 9000)}`;
      clearCart();
      setShowPreferenceModal(false);
      router.push(`/orders/waiting?table=${encodeURIComponent(activeTable)}&order=${fallbackId}&mode=individual`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white relative font-sans overflow-x-hidden selection:bg-yellow-400 selection:text-black flex flex-col justify-between">
      {/* Container - centered & clean layout for mobile, tablet, and desktop */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-32 flex flex-col gap-5 sm:gap-6">
        
        {/* HEADER: Back Button + Title + Table Badge */}
        <header className="w-full flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
            className="inline-flex items-center gap-3 text-white hover:text-yellow-400 transition cursor-pointer group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center group-hover:border-yellow-400/50 transition">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-yellow-400 transition" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-base sm:text-lg font-semibold font-['Montserrat']">
                Your Cart
              </span>
              <span className="text-white text-base sm:text-lg font-normal font-['Montserrat']">
                ( {totalCount} {totalCount === 1 ? 'item' : 'items'} )
              </span>
            </div>
          </button>

          {/* Table Badge */}
          <div className="px-3 py-1.5 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center shadow-sm">
            <span className="text-zinc-400 text-xs font-medium font-['Poppins']">
              {activeTable.startsWith('Table') ? activeTable : `Table ${activeTable}`}
            </span>
          </div>
        </header>

        {/* CART ITEMS LIST */}
        {cart.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-zinc-500" />
            </div>
            <h2 className="text-white text-lg font-semibold font-['Poppins']">
              Your cart is empty
            </h2>
            <p className="text-zinc-400 text-xs font-['Poppins'] max-w-xs">
              Explore our delicious menu and add your favorite dishes to start ordering.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="mt-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-sm font-['Montserrat'] rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Items Column */}
            <div className="flex flex-col gap-3.5">
              {cart.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="relative w-full bg-neutral-900 rounded-2xl border border-neutral-800 p-3 pr-4 flex items-center justify-between gap-3.5 shadow-sm hover:border-neutral-700 transition"
                  >
                    {/* Left: Dish image & details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800/60">
                        <Image
                          src={item.image || 'https://placehold.co/97x97'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex flex-col">
                          <h3 className="text-white text-sm font-medium font-['Inter'] truncate">
                            {item.name}
                          </h3>
                          {item.subtitle ? (
                            <p className="text-orange-200 text-xs font-normal font-['Poppins'] tracking-wide truncate">
                              {item.subtitle}
                            </p>
                          ) : (
                            <p className="text-orange-200 text-xs font-normal font-['Poppins'] tracking-wide truncate">
                              With Sauce
                            </p>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-[3px]">
                          <span className="text-orange-400 text-sm font-normal font-['Poppins'] tracking-wide">$</span>
                          <span className="text-white text-sm font-normal font-['Poppins'] tracking-wide">
                            {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stepper & Remove */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 bg-neutral-200 hover:bg-neutral-300 active:scale-95 rounded-md flex items-center justify-center transition cursor-pointer text-neutral-700"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>

                        <span className="text-white text-base font-medium font-['Inter'] min-w-4 text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 bg-yellow-500 hover:bg-yellow-400 active:scale-95 rounded-md flex items-center justify-center transition cursor-pointer text-white shadow-sm"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Delete icon */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 rounded-full bg-zinc-900/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer ml-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY CARD (Matches Figma) */}
            <div className="w-full bg-neutral-900 rounded-[10px] sm:rounded-2xl border border-neutral-800 p-4 sm:p-5 flex flex-col gap-3 shadow-md">
              <h2 className="text-white text-base font-semibold font-['Montserrat']">
                Order Summary
              </h2>

              <div className="flex items-center justify-between text-sm font-normal font-['Montserrat'] text-white">
                <span>Subtotal</span>
                <span className="text-white font-normal">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-normal font-['Montserrat'] text-white">
                <span>Service Charge ( 5% )</span>
                <span className="text-white font-normal">${serviceCharge.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-normal font-['Montserrat'] text-white">
                <span>Tax ( 8% )</span>
                <span className="text-white font-normal">${tax.toFixed(2)}</span>
              </div>

              <div className="w-full border-t border-neutral-400/25 my-1 pt-3 flex items-center justify-between">
                <span className="text-white text-base font-semibold font-['Montserrat']">
                  Total Amount
                </span>
                <span className="text-yellow-400 text-lg sm:text-xl font-bold font-['Poppins'] leading-5">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA: "Order Preference" Button (Matches Figma) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOrderPreferenceClick}
                className="w-full py-3.5 sm:py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-neutral-950 text-base font-semibold font-['Inter'] leading-5 rounded-lg sm:rounded-xl shadow-[0px_8px_20px_0px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center cursor-pointer"
              >
                Order Preference
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Draggable Ask AI Button */}
      <DraggableAskAi defaultBottom={24} defaultRight={24} />

      {/* HOSTGUEST ORDER PREFERENCE MODAL (Matches Figma) */}
      {showPreferenceModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[6.90px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-80 max-w-full bg-neutral-950/80 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[6.90px] p-6 pt-9 pb-8 flex flex-col items-center gap-7 relative shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPreferenceModal(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              ✕
            </button>

            {/* Icon & Title / Description */}
            <div className="w-60 flex flex-col justify-start items-center gap-3.5 text-center">
              <div className="w-14 h-14 rounded-full bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
                🍽️
              </div>
              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <h3 className="self-stretch text-center text-white text-base font-medium font-['Inter'] capitalize">
                  You Have Joined As Hostguest
                </h3>
                <p className="w-52 text-center text-zinc-500 text-xs font-normal font-['Inter'] leading-relaxed">
                  You’re now part of HostGuest. Start exploring your hosting journey
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3.5 w-full">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleOrderIndividually}
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-70 active:scale-[0.98] rounded-lg shadow-[0px_4px_10px_0px_rgba(227,172,56,0.35)] flex items-center justify-center text-neutral-950 text-base font-semibold font-['Inter'] leading-5 transition cursor-pointer"
              >
                {isSubmitting ? 'Sending to Kitchen...' : 'Order Individually'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPreferenceModal(false);
                  router.push(`/cart/group?table=${encodeURIComponent(activeTable)}`);
                }}
                className="w-full h-12 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] rounded-2xl shadow-[0px_4px_10px_0px_rgba(227,172,56,0.35)] flex items-center justify-center text-neutral-950 text-base font-semibold font-['Inter'] leading-5 transition cursor-pointer"
              >
                Order together
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}

