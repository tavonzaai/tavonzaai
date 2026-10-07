'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Utensils,
  CreditCard,
  Check,
  ArrowLeft,
  Sparkles,
  Barcode,
  ShoppingBag,
} from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { orderService } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';

export type CartStep = 'cart' | 'placed' | 'tracking' | 'payment' | 'confirmation';

interface CartFlowModalProps {
  initialStep?: CartStep;
  onClose: () => void;
  onGoHome?: () => void;
}

export default function CartFlowModal({
  initialStep = 'cart',
  onClose,
  onGoHome,
}: CartFlowModalProps) {
  const [step, setStep] = useState<CartStep>(initialStep);
  const { cart, updateQuantity, removeFromCart, totalCount, subtotal, serviceCharge, tax, totalAmount, tableNumber } = useCart();
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Card details
  const cards = [
    {
      type: 'Mastercard',
      number: '1234 5678 1234 5678',
      holder: 'Sam Louis',
      expires: '07/29',
      cvv: '215',
      gradient: 'from-amber-600 via-amber-500 to-yellow-400',
    },
    {
      type: 'Visa',
      number: '4539 5196 8028 5344',
      holder: 'Avery Morgan',
      expires: '03/28',
      cvv: '705',
      gradient: 'from-slate-700 via-zinc-800 to-neutral-900',
    },
  ];

  const currentCard = cards[selectedCardIdx];

  const handleNextStep = async () => {
    if (step === 'cart') {
      setIsSubmitting(true);
      try {
        const rawBranchId = getCookie('tavonza_branch_id');
        const branchId =
          rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)
            ? rawBranchId
            : null;

        const rawTableId = getCookie('tavonza_table_id');
        const activeTableId =
          rawTableId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawTableId)
            ? rawTableId
            : null;

        if (branchId && activeTableId) {
          const draft = await orderService.getCart(branchId, activeTableId);
          if (draft?.id) {
            const res = await orderService.submitOrder(draft.id);
            setSubmittedOrderId(res.orderNumber || res.id);
          }
        }
      } catch (err) {
        console.warn('Cart submit in modal:', err);
      } finally {
        setIsSubmitting(false);
        setStep('placed');
      }
    } else if (step === 'placed') setStep('tracking');
    else if (step === 'tracking') setStep('payment');
    else if (step === 'payment') setStep('confirmation');
    else if (step === 'confirmation') {
      if (onGoHome) onGoHome();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-black min-h-screen md:min-h-0 md:rounded-3xl border border-white/10 shadow-2xl relative flex flex-col justify-between overflow-x-hidden pb-12 md:pb-6 pt-2">

        {/* STEP 1: YOUR CART */}
        {step === 'cart' && (
          <div className="w-full flex-1 flex flex-col justify-between p-5 gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-amber-500/30 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500/50 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-semibold text-white font-['Montserrat']">Your Cart</h2>
                    <span className="text-sm text-neutral-400 font-['Montserrat']">( {totalCount} items )</span>
                  </div>
                </div>

                <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="w-full py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <ShoppingBag className="w-12 h-12 text-zinc-600" />
                  <p className="text-sm text-zinc-400">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-lg relative"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 relative rounded-xl overflow-hidden shrink-0 border border-white/10 bg-neutral-950">
                          <Image src={item.image || '/images/slide1.jpg'} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-semibold text-white font-['Montserrat'] truncate">{item.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded-full bg-orange-400/30 border border-neutral-700 flex items-center justify-center text-black hover:bg-orange-400/50 transition cursor-pointer text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="text-xs font-bold text-white font-['Inter'] w-4 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded-full bg-orange-400 border border-neutral-700 flex items-center justify-center text-black hover:bg-orange-300 transition cursor-pointer text-black"
                            >
                              <Plus className="w-3 h-3 text-black" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-amber-500 font-['Poppins']">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary Box */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                <h3 className="text-sm font-semibold text-white font-['Montserrat']">Order Summary</h3>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Service Charge ( 5% )</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Tax ( 8% )</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-neutral-700/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white font-['Montserrat']">Total Amount</span>
                  <span className="text-base font-bold text-amber-500 font-['Poppins']">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              disabled={isSubmitting || cart.length === 0}
              onClick={handleNextStep}
              className="w-full h-12 bg-orange-400 hover:bg-orange-300 disabled:opacity-50 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl shadow-lg shadow-yellow-500/20 transition active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        )}

        {/* STEP 2: ORDER PLACED SUCCESSFULLY */}
        {step === 'placed' && (
          <div className="w-full flex-1 flex flex-col justify-between p-6 gap-6 items-center text-center animate-in fade-in duration-300 pt-10">
            <div className="flex flex-col items-center gap-6 w-full my-auto">
              {/* Animated Gold Dashed Circle Check */}
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-yellow-400 flex items-center justify-center p-2 bg-yellow-400/10 shadow-2xl shadow-yellow-500/20 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white font-['Montserrat']">Order Placed Successfully</h2>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xs font-['Poppins']">
                  Your order has been sent to the kitchen. We'll notify you when it's ready.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 text-left shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-semibold text-white">Order Summary</span>
                  <span className="text-xs font-mono font-bold text-yellow-400">LT-2847</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Order Ref</span>
                  <span className="text-white font-mono font-semibold">LT-2847</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Estimated Preparation</span>
                  <span className="text-yellow-400 font-semibold">15–20 min</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Table Number</span>
                  <span className="text-white font-semibold">Table 08</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl shadow-lg shadow-yellow-500/20 transition active:scale-[0.99]"
            >
              Track Order
            </button>
          </div>
        )}

        {/* STEP 3: TRACK YOUR ORDER */}
        {step === 'tracking' && (
          <div className="w-full flex-1 flex flex-col justify-between p-5 gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('placed')}
                  className="w-9 h-9 rounded-full bg-amber-500/30 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500/50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-white font-['Montserrat']">Track Your Order</h2>
              </div>

              {/* Estimated Time Header */}
              <div className="flex flex-col items-center gap-1.5 py-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                  <Clock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">ESTIMATED TIME</span>
                <span className="text-2xl font-bold text-yellow-400 font-['Poppins']">18 min</span>
              </div>

              {/* Live Timeline Card */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-6 shadow-lg relative">
                {/* Step 1: Order Received */}
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black shrink-0 z-10">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-semibold text-white">Order Received</h4>
                    <span className="text-[10px] text-neutral-400">Completed</span>
                  </div>
                  {/* Connecting Line */}
                  <div className="absolute left-4 top-8 w-0.5 h-10 bg-yellow-400" />
                </div>

                {/* Step 2: Preparing */}
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black shrink-0 z-10 animate-pulse">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-semibold text-white">Preparing</h4>
                    <span className="text-[10px] text-yellow-400 font-medium">In progress...</span>
                  </div>
                  <div className="absolute left-4 top-8 w-0.5 h-10 bg-neutral-700" />
                </div>

                {/* Step 3: Ready */}
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0 z-10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-medium text-neutral-400">Ready</h4>
                  </div>
                  <div className="absolute left-4 top-8 w-0.5 h-10 bg-neutral-700" />
                </div>

                {/* Step 4: Served */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-medium text-neutral-400">Served</h4>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl shadow-lg shadow-yellow-500/20 transition active:scale-[0.99]"
            >
              Complete Payment
            </button>
          </div>
        )}

        {/* STEP 4: COMPLETE PAYMENT */}
        {step === 'payment' && (
          <div className="w-full flex-1 flex flex-col justify-between p-5 gap-5 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('tracking')}
                  className="w-9 h-9 rounded-full bg-amber-500/30 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500/50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-white font-['Poppins']">Complete Payment</h2>
              </div>

              {/* Bill Summary Box */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                <div className="pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-white font-['Montserrat']">Bill Summary</span>
                </div>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Items</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-white font-['Montserrat']">
                  <span>Service Charge (5%)</span>
                  <span className="font-semibold">${serviceCharge.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between">
                  <span className="text-base font-bold text-white font-['Montserrat']">Total</span>
                  <span className="text-base font-bold text-orange-400 font-['Montserrat']">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Select Payment Method Swiper Cards */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-white font-['Poppins']">Select Card</span>

                <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1">
                  {cards.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCardIdx(idx)}
                      className={`w-64 h-36 p-4 rounded-2xl bg-gradient-to-r ${card.gradient} text-black shrink-0 cursor-pointer snap-start transition shadow-xl border-2 flex flex-col justify-between ${
                        selectedCardIdx === idx ? 'border-white scale-[1.02]' : 'border-transparent opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider">
                        <span>Credit</span>
                        <span>{card.type}</span>
                      </div>

                      <div className="text-sm font-mono tracking-widest font-semibold">
                        {card.number}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-medium">
                        <div>
                          <span className="opacity-70 block text-[8px]">Card Holder</span>
                          <span>{card.holder}</span>
                        </div>
                        <div>
                          <span className="opacity-70 block text-[8px]">Expires</span>
                          <span>{card.expires}</span>
                        </div>
                        <div>
                          <span className="opacity-70 block text-[8px]">CVV</span>
                          <span>{card.cvv}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Details Form Box */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/70 font-['Inter']">Card Number</label>
                  <input
                    type="text"
                    readOnly
                    value={currentCard.number}
                    className="w-full bg-transparent border-b border-zinc-700 text-sm font-semibold text-white py-1 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/70 font-['Inter']">Name</label>
                    <input
                      type="text"
                      readOnly
                      value={currentCard.holder}
                      className="w-full bg-transparent border-b border-zinc-700 text-sm font-semibold text-white py-1 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/70 font-['Inter']">Card ID</label>
                    <input
                      type="text"
                      readOnly
                      value={currentCard.type}
                      className="w-full bg-transparent border-b border-zinc-700 text-sm font-semibold text-white py-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/70 font-['Inter']">Expiration Date</label>
                    <input
                      type="text"
                      readOnly
                      value={currentCard.expires}
                      className="w-full bg-transparent border-b border-zinc-700 text-sm font-semibold text-white py-1 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white/70 font-['Inter']">CVV</label>
                    <input
                      type="text"
                      readOnly
                      value={currentCard.cvv}
                      className="w-full bg-transparent border-b border-zinc-700 text-sm font-semibold text-white py-1 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-12 bg-orange-400 hover:bg-orange-300 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl shadow-lg shadow-yellow-500/20 transition active:scale-[0.99]"
            >
              Pay ${totalAmount.toFixed(2)}
            </button>
          </div>
        )}

        {/* STEP 5: CONFIRMATION RECEIPT */}
        {step === 'confirmation' && (
          <div className="w-full flex-1 flex flex-col justify-between p-5 gap-5 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-amber-500/30 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500/50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-white font-['Montserrat']">Confirmation</h2>
              </div>

              {/* Ticket Pass Receipt Card */}
              <div className="w-full bg-neutral-900 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl relative">
                {/* Yellow Check Circle Badge */}
                <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400 flex items-center justify-center text-black -mt-9 shadow-lg shadow-yellow-500/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="text-center flex flex-col gap-1 pt-1">
                  <h3 className="text-lg font-bold text-white font-['Montserrat']">Thank you!</h3>
                  <p className="text-xs text-neutral-400 font-['Poppins']">
                    Your transaction was successful <br />
                    <span className="font-mono text-[10px] text-yellow-400">#ID-22465476578390-3789</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Date</span>
                    <span className="text-white font-medium">01/24/2026</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Time</span>
                    <span className="text-white font-medium">10:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>To</span>
                    <span className="text-white font-medium">Maison Verde</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-yellow-400 font-['DM_Sans']">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Tavonza Card Badge */}
                <div className="p-3 bg-black/60 border border-yellow-400/30 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-6 bg-yellow-400 rounded-md flex items-center justify-center text-black font-bold text-[9px]">
                    TAVONZA
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Tavonza VIP Black</span>
                    <span className="text-[10px] text-neutral-400">{currentCard.holder}</span>
                  </div>
                </div>

                {/* Perforation Line & Barcode Stamp */}
                <div className="pt-3 border-t border-dashed border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-16 h-8 text-white shrink-0" />
                    <span className="text-[9px] font-mono text-neutral-400">||| | |||| |||</span>
                  </div>

                  <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400 text-yellow-400 font-bold text-xs rounded-md uppercase tracking-wider">
                    PAID
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                onClose();
              }}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-base font-semibold font-['Montserrat'] rounded-2xl shadow-lg shadow-yellow-500/20 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
