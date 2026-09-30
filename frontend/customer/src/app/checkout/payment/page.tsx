'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart, tableNumber } = useCart();

  const amountParam = searchParams.get('amount');
  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  const baseAmount = amountParam ? parseFloat(amountParam) : 18.19;
  const tax = Number((baseAmount * 0.08).toFixed(2));
  const serviceCharge = Number((baseAmount * 0.05).toFixed(2));
  const totalAmount = Number((baseAmount + tax + serviceCharge).toFixed(2));

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MASTERCARD' | 'VISA'>('MASTERCARD');
  const [cardNumber, setCardNumber] = useState('1234 5678 1234 5678');
  const [cardHolder, setCardHolder] = useState('Sam Louis');
  const [cardId, setCardId] = useState('Mastercard');
  const [expiryDate, setExpiryDate] = useState('07/29');
  const [cvv, setCvv] = useState('215');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      router.push(
        `/checkout/confirmation?amount=${totalAmount.toFixed(2)}&method=${paymentMethod}&table=${encodeURIComponent(
          activeTable
        )}&holder=${encodeURIComponent(cardHolder)}`
      );
    }, 800);
  };

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide2.jpg"
      imageAlt="Tavonza Gourmet Payment"
      badgeText="256-Bit Encrypted"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Seamless Table <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Payment & Checkout
          </span>
        </h1>
      }
      subheadline="Pay quickly using your preferred card or cash. No waiting for the card machine — your receipt is generated instantly."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Direct Settlement</span>
              <span className="text-yellow-400 text-base font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-montserrat">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure SSL</span>
          </div>
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
              Complete Payment
            </h1>
          </div>

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* 1. BILL SUMMARY CARD */}
        <div className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-white text-xs font-bold font-montserrat uppercase tracking-wider">
              Bill Summary
            </span>
            <span className="text-xs text-zinc-400 font-mono">{activeTable}</span>
          </div>

          <div className="p-4 flex flex-col gap-2.5 text-xs sm:text-sm font-montserrat">
            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-normal">Subtotal Items</span>
              <span className="text-white font-semibold">${baseAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-medium">Tax (8%)</span>
              <span className="text-white font-semibold">${tax.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-white/90">
              <span className="text-zinc-400 font-normal">Service Charge (5%)</span>
              <span className="text-white font-semibold">${serviceCharge.toFixed(2)}</span>
            </div>

            <div className="w-full h-px bg-neutral-800 my-0.5" />

            <div className="flex items-center justify-between pt-1">
              <span className="text-white text-base font-bold font-montserrat">
                Total Amount
              </span>
              <span className="text-[#E3AC38] text-lg sm:text-xl font-bold font-montserrat">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PAYMENT METHOD TABS */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-white/80 text-xs font-semibold font-montserrat uppercase tracking-wider">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('MASTERCARD');
                setCardId('Mastercard');
              }}
              className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-xs font-montserrat ${
                paymentMethod === 'MASTERCARD'
                  ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Mastercard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('VISA');
                setCardId('Visa');
              }}
              className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-xs font-montserrat ${
                paymentMethod === 'VISA'
                  ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Visa</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-xs font-montserrat ${
                paymentMethod === 'CASH'
                  ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash</span>
            </button>
          </div>
        </div>

        {/* 3. VIRTUAL CARD PREVIEW */}
        {paymentMethod !== 'CASH' && (
          <div className="w-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 text-black p-4 rounded-xl shadow-lg flex flex-col justify-between h-36 font-mono select-none">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">{cardId}</span>
              <span className="text-[10px] font-sans font-semibold bg-black/15 px-2 py-0.5 rounded-full">
                Tavonza Pay
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold tracking-widest my-auto">{cardNumber}</div>
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="block text-[8px] uppercase opacity-70">Cardholder</span>
                <span className="font-semibold">{cardHolder}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase opacity-70">Expires</span>
                <span className="font-semibold">{expiryDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. CARD FORM INPUTS */}
        {paymentMethod !== 'CASH' ? (
          <div className="flex flex-col gap-3.5 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs font-inter">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 1234 5678"
                className="w-full pb-1.5 bg-transparent border-b border-neutral-700 text-white font-inter text-sm font-semibold focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs font-inter">Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Sam Louis"
                  className="w-full pb-1.5 bg-transparent border-b border-neutral-700 text-white font-inter text-sm font-semibold focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs font-inter">Expires</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="07/29"
                  className="w-full pb-1.5 bg-transparent border-b border-neutral-700 text-white font-inter text-sm font-semibold focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Pay With Cash</span>
              <span className="text-zinc-400 text-[11px] font-poppins">Our staff will collect ${totalAmount.toFixed(2)} directly at your table.</span>
            </div>
          </div>
        )}

        {/* CTA: PAY BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="w-full py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Processing Payment...' : `Pay ($${totalAmount.toFixed(2)})`}
          </button>
        </div>
      </div>
    </DesktopSplitLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
