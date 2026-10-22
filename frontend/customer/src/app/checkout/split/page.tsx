'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Receipt, Users, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import { paymentService, TableBillCalculationResponse } from '@/redux/features/paymentApi';
import { orderService, OrderDetailResponse } from '@/redux/features/orderApi';
import { sessionService } from '@/redux/features/sessionApi';
import { getCookie } from '@/redux/api/baseApi';
import { toast } from 'sonner';

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

function SplitBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, tableNumber } = useCart();

  const urlOrderId = (searchParams.get('order') || searchParams.get('orderId') || searchParams.get('id') || '').trim();
  const activeTable = searchParams.get('table') || tableNumber || 'Table';

  const [orderId, setOrderId] = useState<string>(() => {
    if (urlOrderId) return urlOrderId;
    return (getCookie('tavonza_last_submitted_order_id') || getCookie('tavonza_active_order_id') || '').trim();
  });

  const [splitMode, setSplitMode] = useState<'ITEMS' | 'EQUAL'>('ITEMS');
  const [equalGuests, setEqualGuests] = useState<number>(2);

  // Authoritative Session Bill State
  const [sessionBill, setSessionBill] = useState<TableBillCalculationResponse | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Authoritative Bill & Items
  useEffect(() => {
    let isMounted = true;

    async function loadBillAndItems() {
      try {
        setLoading(true);
        const cached = sessionService.getCachedSessionInfo();
        const sessionId = searchParams.get('session') || cached.tableSessionId;

        // 1. If tableSessionId is available, calculate consolidated table bill
        if (sessionId) {
          paymentService.getSessionBill(sessionId).then((bill) => {
            if (isMounted) setSessionBill(bill);
          }).catch(() => null);
        }

        // 2. Fetch authoritative order details
        if (orderId) {
          const detail = await orderService.getOrderDetail(orderId);
          if (isMounted && detail) {
            setOrderDetail(detail);
          }
        }
      } catch (err: any) {
        console.error('Failed to load bill/order details for split:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBillAndItems();
    return () => {
      isMounted = false;
    };
  }, [orderId, searchParams]);

  // Construct items from authoritative orderDetail or fallback to cart
  const items: SplitItem[] = useMemo(() => {
    if (orderDetail?.items && orderDetail.items.length > 0) {
      return orderDetail.items.map((it, idx) => ({
        id: it.id || `item-${idx}`,
        name: it.name || 'Dish Item',
        subtitle: it.specialInstructions || 'Kitchen Standard',
        price: Number(it.unitPrice || 0),
        quantity: it.quantity || 1,
        image: it.imageUrl || '/images/burger.jpg',
        owner: 'my',
        ownerLabel: 'Table Order',
      }));
    }

    if (cart.length > 0) {
      return cart.map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.subtitle || 'Customized',
        price: c.price,
        quantity: c.quantity,
        image: c.image || '/images/burger.jpg',
        owner: 'my',
        ownerLabel: 'My Selection',
      }));
    }

    return [
      {
        id: 'split-1',
        name: 'Artisan Gourmet Burger',
        subtitle: 'Tavonza Signature',
        price: 24.0,
        quantity: 1,
        image: '/images/burger.jpg',
        owner: 'my',
        ownerLabel: 'Table Order',
      },
    ];
  }, [orderDetail, cart]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((i) => i.id));

  // Toggle item selection
  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalBillDue = useMemo(() => {
    if (sessionBill?.balanceDue !== undefined && sessionBill.balanceDue > 0) {
      return sessionBill.balanceDue;
    }
    if (orderDetail?.total) {
      return Number(orderDetail.total);
    }
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [sessionBill, orderDetail, items]);

  const calculatedPortion = useMemo(() => {
    if (splitMode === 'EQUAL') {
      return totalBillDue > 0 ? Number((totalBillDue / equalGuests).toFixed(2)) : 0;
    }

    // Split by selected items
    const selectedSum = items
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const fullItemsSum = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (fullItemsSum > 0 && totalBillDue > fullItemsSum) {
      // Pro-rate tax and charges proportionally
      const ratio = selectedSum / fullItemsSum;
      return Number((totalBillDue * ratio).toFixed(2));
    }
    return Number(selectedSum.toFixed(2));
  }, [splitMode, equalGuests, totalBillDue, items, selectedIds]);

  const handleProceedToPayment = () => {
    const finalAmount = calculatedPortion > 0 ? calculatedPortion.toFixed(2) : totalBillDue.toFixed(2);
    router.push(
      `/checkout/payment?order=${encodeURIComponent(orderId)}&amount=${finalAmount}&table=${encodeURIComponent(activeTable)}&split=true`
    );
  };

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
      subheadline="Select the dishes you enjoyed or split equally among your table guests with authoritative ledger calculation."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Your Calculated Share</span>
              <span className="text-yellow-400 text-base font-bold">${calculatedPortion.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Balance Due: ${totalBillDue.toFixed(2)}
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

        {/* 1. SESSION BILL SUMMARY */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-400 text-xs font-montserrat">Total Session Balance Due</span>
            <span className="text-yellow-400 text-xl font-bold font-poppins">
              ${totalBillDue.toFixed(2)}
            </span>
          </div>

          {sessionBill && sessionBill.paidAmount > 0 && (
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              ${sessionBill.paidAmount.toFixed(2)} Already Paid
            </span>
          )}
        </div>

        {/* 2. SPLIT MODE SELECTOR */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSplitMode('ITEMS')}
            className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold font-montserrat transition cursor-pointer ${
              splitMode === 'ITEMS'
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>Split by Items</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode('EQUAL')}
            className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold font-montserrat transition cursor-pointer ${
              splitMode === 'EQUAL'
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Split Equally</span>
          </button>
        </div>

        {/* 3. MODE: EQUAL SPLIT */}
        {splitMode === 'EQUAL' ? (
          <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-semibold font-montserrat uppercase tracking-wider">
                Number of Diners
              </span>
              <span className="text-yellow-400 font-bold text-sm font-mono">
                {equalGuests} Persons
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setEqualGuests(num)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    equalGuests === num
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-neutral-950 border-neutral-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {num} Diners
                </button>
              ))}
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-zinc-400">Each Person Pays:</span>
              <span className="text-yellow-400 text-base font-bold font-poppins">
                ${(totalBillDue / equalGuests).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          /* 3. MODE: SPLIT BY ITEMS */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xs font-semibold font-montserrat uppercase tracking-wider">
                Select Your Dishes
              </h2>
              <button
                type="button"
                onClick={() =>
                  setSelectedIds(selectedIds.length === items.length ? [] : items.map((i) => i.id))
                }
                className="text-xs text-yellow-400 hover:underline cursor-pointer"
              >
                {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-zinc-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span>Loading order dishes...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {items.map((item) => {
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

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
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
            )}
          </div>
        )}

        {/* BOTTOM ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={calculatedPortion <= 0}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-montserrat rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pay Portion (${calculatedPortion.toFixed(2)})
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

