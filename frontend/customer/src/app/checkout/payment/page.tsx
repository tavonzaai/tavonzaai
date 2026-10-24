'use client';

import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Tag,
  Percent,
  X,
  Users,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import {
  paymentService,
  StripePaymentIntentResponse,
  PaymentOptionsResponse,
  DiscountEvaluationResponse,
  PaymentResponse,
} from '@/redux/features/paymentApi';
import { orderService, OrderTrackingResponse } from '@/redux/features/orderApi';
import { sessionService } from '@/redux/features/sessionApi';
import { getCookie } from '@/redux/api/baseApi';
import { toast } from 'sonner';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart, tableNumber } = useCart();

  const urlOrderId = (searchParams.get('order') || searchParams.get('id') || '').trim();
  const activeTable = searchParams.get('table') || tableNumber || 'Table';

  const [orderId, setOrderId] = useState<string>(() => {
    if (urlOrderId) return urlOrderId;
    return (getCookie('tavonza_last_submitted_order_id') || getCookie('tavonza_active_order_id') || '').trim();
  });

  const [orderData, setOrderData] = useState<OrderTrackingResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authoritative Payment Options & Config
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptionsResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashRequestPending, setCashRequestPending] = useState(false);
  const [cashRequestRef, setCashRequestRef] = useState<string | null>(null);

  // Authoritative Paid Check from Payment Ledger
  const [settledPayment, setSettledPayment] = useState<PaymentResponse | null>(null);

  // Discount / Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountEvaluationResponse | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Tip Selection State (Percentage or Custom)
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  // Waiter Assistance State
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

  // Stripe State
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeMountError, setStripeMountError] = useState<string | null>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Authoritative Order Data & Existing Payments
  useEffect(() => {
    let isMounted = true;

    async function loadAuthoritativeOrder() {
      if (!orderId) {
        setLoadingOrder(false);
        return;
      }

      try {
        setLoadingOrder(true);
        // Load authoritative order details
        const data = await orderService.getOrderDetail(orderId);
        if (isMounted && data) {
          setOrderData({
            id: data.orderId,
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            branchId: data.branchId,
            tableId: data.tableId,
            status: data.status,
            displayStatus: data.displayStatus,
            estimatedPrepTime: data.estimatedPrepTime,
            items: data.items || [],
            subtotal: data.subtotal,
            taxAmount: data.tax,
            serviceCharge: data.serviceCharge,
            totalAmount: data.total,
            total: data.total,
          });

          // Fetch branch payment options if branchId is available
          if (data.branchId) {
            paymentService.getPaymentOptions(data.branchId).then((opts) => {
              if (isMounted) setPaymentOptions(opts);
            }).catch(() => null);
          }
        }

        // Authoritatively check if order has already been paid via payments ledger
        const paymentsList = await paymentService.getPaymentsByOrder(orderId);
        if (isMounted && paymentsList && paymentsList.length > 0) {
          const paidRecord = paymentsList.find(
            (p) => String(p.status).toUpperCase() === 'PAID' || String(p.status).toUpperCase() === 'COMPLETED'
          );
          if (paidRecord) {
            setSettledPayment(paidRecord);
          }
        }
      } catch (err: any) {
        console.error('Failed to load order for payment:', err);
        try {
          const trackData = await orderService.trackOrder(orderId);
          if (isMounted && trackData) {
            setOrderData(trackData);
          }
        } catch {
          if (isMounted) {
            setErrorMessage('Could not load authoritative order details. Please verify your order ID.');
          }
        }
      } finally {
        if (isMounted) setLoadingOrder(false);
      }
    }

    loadAuthoritativeOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Derived Amounts & Calculations
  const baseSubtotal = Number(orderData?.subtotal ?? ((orderData?.totalAmount ?? (orderData?.total ? Number(orderData.total) : 0)) * 0.87));
  const discountAmount = appliedDiscount ? Number(appliedDiscount.discountAmount) : 0;
  const netSubtotal = Math.max(0, baseSubtotal - discountAmount);
  const taxAmount = Number(orderData?.taxAmount ?? ((orderData?.totalAmount ?? (orderData?.total ? Number(orderData.total) : 0)) * 0.13));
  const serviceCharge = Number(orderData?.serviceCharge ?? 0);

  const calculatedTip = useMemo(() => {
    if (customTip && !isNaN(Number(customTip)) && Number(customTip) >= 0) {
      return Number(Number(customTip).toFixed(2));
    }
    if (tipPercent > 0) {
      return Number(((netSubtotal * tipPercent) / 100).toFixed(2));
    }
    return 0;
  }, [netSubtotal, tipPercent, customTip]);

  const finalTotalDue = Math.max(0, netSubtotal + taxAmount + serviceCharge + calculatedTip);

  const isOrderConfirmed =
    orderData?.status && ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].includes(orderData.status.toUpperCase());
  const isAlreadyPaid = Boolean(settledPayment || orderData?.paymentStatus === 'PAID');

  // 2. Initialize Stripe PaymentIntent when Card is selected
  useEffect(() => {
    if (paymentMethod !== 'CARD' || !orderId || !isOrderConfirmed || isAlreadyPaid) {
      return;
    }

    let isMounted = true;
    async function initStripe() {
      try {
        setStripeLoading(true);
        setStripeMountError(null);

        const cached = sessionService.getCachedSessionInfo();
        const intentRes: StripePaymentIntentResponse = await paymentService.createStripePaymentIntent({
          orderId,
          tableSessionId: cached.tableSessionId || undefined,
          discountCode: appliedDiscount?.code,
          tipAmount: calculatedTip > 0 ? calculatedTip : undefined,
        });

        if (!isMounted) return;

        setClientSecret(intentRes.clientSecret);
        setPaymentIntentId(intentRes.paymentIntentId);

        const pubKey = intentRes.publishableKey || paymentOptions?.publishableKey;
        if (pubKey) {
          const stripeObj = await loadStripe(pubKey);
          if (!isMounted || !stripeObj) return;

          setStripeInstance(stripeObj);

          // Mount card element if container is ready
          const elements = stripeObj.elements();
          const card = elements.create('card', {
            style: {
              base: {
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '15px',
                '::placeholder': {
                  color: '#71717a',
                },
              },
              invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
              },
            },
          });

          if (cardElementRef.current) {
            cardElementRef.current.innerHTML = '';
            card.mount(cardElementRef.current);
            setCardElement(card);
          }
        }
      } catch (err: any) {
        console.error('Stripe initialization failed:', err);
        if (isMounted) {
          setStripeMountError(err.message || 'Failed to initialize secure Stripe checkout.');
        }
      } finally {
        if (isMounted) setStripeLoading(false);
      }
    }

    initStripe();

    return () => {
      isMounted = false;
      if (cardElement) {
        cardElement.destroy();
      }
    };
  }, [paymentMethod, orderId, isOrderConfirmed, isAlreadyPaid, appliedDiscount, calculatedTip, paymentOptions?.publishableKey]);

  // 3. Realtime Socket Listener for Payment & Order Status Updates
  useEffect(() => {
    function handleRealtimePayment(e: Event) {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (detail && detail.orderId === orderId && detail.status === 'PAID') {
        clearCart();
        toast.success('Payment settled by cashier or gateway!');
        router.push(
          `/checkout/confirmation?amount=${Number(detail.amount || finalTotalDue).toFixed(2)}&ref=${encodeURIComponent(
            detail.transactionRef || detail.paymentId || ''
          )}&table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(orderId)}&holder=Valued Guest`
        );
      }
    }

    function handleRealtimeOrder(e: Event) {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (detail && (detail.id === orderId || detail.orderId === orderId)) {
        if (['CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(detail.status?.toUpperCase())) {
          setOrderData((prev) => (prev ? { ...prev, status: detail.status } : null));
        }
      }
    }

    window.addEventListener('tavonza:payment_status_changed', handleRealtimePayment);
    window.addEventListener('tavonza:order_status_changed', handleRealtimeOrder);

    return () => {
      window.removeEventListener('tavonza:payment_status_changed', handleRealtimePayment);
      window.removeEventListener('tavonza:order_status_changed', handleRealtimeOrder);
    };
  }, [orderId, finalTotalDue, activeTable, clearCart, router]);

  // 4. Promo Voucher Application Handler
  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      const evaluation = await paymentService.applyDiscount(code, baseSubtotal);
      setAppliedDiscount(evaluation);
      toast.success(`Promo code ${code} applied! Saved $${evaluation.discountAmount.toFixed(2)}.`);
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired voucher code';
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoCodeInput('');
    setPromoError(null);
  };

  // 5. Handle Stripe Card Submission
  const handleStripePay = async () => {
    if (!stripeInstance || !cardElement || !clientSecret || !paymentIntentId) {
      setErrorMessage('Stripe payment form is not yet ready. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Authoritative client confirmation with Stripe
      const result = await stripeInstance.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        const msg = result.error.message || 'Payment processing was declined by Stripe.';
        setErrorMessage(msg);
        toast.error(msg);
        setIsProcessing(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Authoritative server-side verification and persistence
        const verification = await paymentService.verifyStripePayment(paymentIntentId);
        if (verification.status === 'PAID') {
          clearCart();
          toast.success('Payment settled successfully!');
          router.push(
            `/checkout/confirmation?amount=${finalTotalDue.toFixed(2)}&ref=${encodeURIComponent(
              paymentIntentId
            )}&table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(orderId)}&holder=Cardholder`
          );
        } else {
          const msg = 'Payment received by gateway, awaiting final ledger settlement.';
          setErrorMessage(msg);
          toast.error(msg);
        }
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      const msg = err.message || 'An error occurred during payment verification.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Handle Offline Cash Request
  const handleCashRequest = async () => {
    if (!orderId) {
      const msg = 'No active order ID available to request cash payment.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const cached = sessionService.getCachedSessionInfo();
      const res = await paymentService.requestOfflinePayment({
        orderId,
        tableSessionId: cached.tableSessionId || undefined,
        method: 'CASH',
        discountCode: appliedDiscount?.code,
        tipAmount: calculatedTip > 0 ? calculatedTip : undefined,
      });

      setCashRequestPending(true);
      setCashRequestRef(res.transactionRef || res.id || 'REQ-CASH');
      toast.success('Cash payment request dispatched to the cashier!');
    } catch (err: any) {
      console.error('Failed to request cash payment:', err);
      const msg = err.message || 'Could not submit cash payment request to the cashier.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Call Waiter for Bill Assistance
  const handleCallWaiter = async () => {
    const cached = sessionService.getCachedSessionInfo();
    const branchId = orderData?.branchId || cached.branchId;
    const tableId = orderData?.tableId || cached.tableId;
    const tableSessionId = cached.tableSessionId;

    if (!branchId || !tableId || !tableSessionId) {
      toast.error('Session details unavailable to page waiter.');
      return;
    }

    setIsCallingWaiter(true);
    try {
      await paymentService.requestWaiterAlert({
        branchId,
        tableId,
        tableSessionId,
        type: 'request_bill',
        message: `Guest at ${activeTable} requested bill assistance`,
      });
      toast.success('Waiter alerted! A server will attend to your table shortly.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch alert to staff');
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const currencySymbol = paymentOptions?.currency === 'EUR' ? '€' : paymentOptions?.currency === 'GBP' ? '£' : '$';

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide2.jpg"
      imageAlt="Tavonza Table Payment"
      badgeText="Stripe Test Mode / Secure"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Authoritative Table <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Payment & Checkout
          </span>
        </h1>
      }
      subheadline="Pay securely using Stripe online, apply promotional vouchers, split the bill with guests, or request table cash collection."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-yellow-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Outstanding Balance</span>
              <span className="text-yellow-400 text-base font-bold">
                {currencySymbol}{finalTotalDue.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-montserrat">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted</span>
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              {orderData?.orderNumber ? `#${orderData.orderNumber}` : activeTable}
            </span>
          </div>
        </header>

        {/* ERROR / WARNING MESSAGES */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ELIGIBILITY WARNING: PENDING WAITER CONFIRMATION */}
        {orderData && !isOrderConfirmed && !isAlreadyPaid && (
          <div className="p-4 bg-amber-950/60 border border-amber-700/80 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
            <div className="flex flex-col gap-1">
              <span className="text-amber-200 text-xs font-semibold font-montserrat">
                Awaiting Waiter Confirmation
              </span>
              <p className="text-amber-300/80 text-xs font-inter leading-relaxed">
                Order <span className="font-mono font-bold">#{orderData.orderNumber}</span> must be confirmed by your server before payment can be accepted. Once confirmed, payment options will become active.
              </p>
            </div>
          </div>
        )}

        {/* ALREADY PAID BANNER & SAFEGUARD */}
        {isAlreadyPaid && (
          <div className="p-5 bg-emerald-950/70 border border-emerald-600/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-emerald-100 text-sm font-bold font-montserrat">
                  Order Successfully Settled
                </span>
                <span className="text-emerald-300/80 text-xs font-inter">
                  Ref: {settledPayment?.transactionRef || 'PAID'} • No outstanding balance remaining.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/checkout/confirmation?amount=${finalTotalDue.toFixed(2)}&ref=${encodeURIComponent(
                      settledPayment?.transactionRef || ''
                    )}&table=${encodeURIComponent(activeTable)}&order=${encodeURIComponent(orderId)}`
                  )
                }
                className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition"
              >
                View Official Receipt
              </button>
              <button
                type="button"
                onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
                className="px-3 py-2 bg-neutral-900 border border-neutral-700 text-zinc-300 text-xs font-semibold rounded-lg hover:bg-neutral-800 transition"
              >
                Return to Menu
              </button>
            </div>
          </div>
        )}

        {/* 1. BILL SUMMARY CARD */}
        <div className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-white text-xs font-bold font-montserrat uppercase tracking-wider">
              Authoritative Bill Breakdown
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Status: <span className="text-yellow-400 font-semibold">{orderData?.status || 'Active'}</span>
            </span>
          </div>

          <div className="p-4 flex flex-col gap-2.5 text-xs sm:text-sm font-montserrat">
            {loadingOrder ? (
              <div className="flex items-center justify-center py-4 text-zinc-500 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span>Loading authoritative bill details...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-zinc-400 font-normal">Subtotal</span>
                  <span className="text-white font-semibold">
                    {currencySymbol}{baseSubtotal.toFixed(2)}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Promo Discount ({appliedDiscount.code})</span>
                    </span>
                    <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-white/90">
                  <span className="text-zinc-400 font-medium">Taxes & Surcharges</span>
                  <span className="text-white font-semibold">
                    {currencySymbol}{taxAmount.toFixed(2)}
                  </span>
                </div>

                {serviceCharge > 0 && (
                  <div className="flex items-center justify-between text-white/90">
                    <span className="text-zinc-400 font-medium">Service Charge</span>
                    <span className="text-white font-semibold">
                      {currencySymbol}{serviceCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculatedTip > 0 && (
                  <div className="flex items-center justify-between text-amber-300 font-medium">
                    <span>Added Gratuity / Tip</span>
                    <span>+{currencySymbol}{calculatedTip.toFixed(2)}</span>
                  </div>
                )}

                <div className="w-full h-px bg-neutral-800 my-0.5" />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-white text-base font-bold font-montserrat">
                    Total Due
                  </span>
                  <span className="text-[#E3AC38] text-lg sm:text-xl font-bold font-montserrat">
                    {currencySymbol}{finalTotalDue.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. PROMO CODE / VOUCHER SECTION */}
        {/* <div className="w-full bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-white/80 text-xs font-semibold font-montserrat uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-yellow-400" />
              <span>Promotional Discount Voucher</span>
            </label>
            {appliedDiscount && (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {appliedDiscount ? (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-700/60 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40">
                  {appliedDiscount.code}
                </span>
                <span className="text-emerald-200">
                  {appliedDiscount.type === 'PERCENTAGE' ? 'Percentage discount' : 'Fixed deduction'} applied
                </span>
              </div>
              <span className="font-bold text-emerald-400">-{currencySymbol}{appliedDiscount.discountAmount.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code (e.g. WELCOME10)"
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value.toUpperCase());
                  setPromoError(null);
                }}
                disabled={isApplyingPromo || isAlreadyPaid}
                className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={!promoCodeInput.trim() || isApplyingPromo || isAlreadyPaid}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold font-montserrat rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                {isApplyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Apply</span>}
              </button>
            </div>
          )}

          {promoError && (
            <span className="text-[11px] text-red-400 font-inter">{promoError}</span>
          )}
        </div> */}

        {/* 3. TIPPING OPTIONS */}
        {/* <div className="w-full bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl flex flex-col gap-2.5">
          <label className="text-white/80 text-xs font-semibold font-montserrat uppercase tracking-wider">
            Add Server Gratuity (Tip)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[0, 10, 15, 20].map((percent) => (
              <button
                key={percent}
                type="button"
                disabled={isAlreadyPaid}
                onClick={() => {
                  setTipPercent(percent);
                  setCustomTip('');
                }}
                className={`py-2 rounded-lg border text-xs font-montserrat font-semibold transition cursor-pointer ${
                  tipPercent === percent && !customTip
                    ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                    : 'bg-neutral-950 border-neutral-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {percent === 0 ? 'None' : `${percent}%`}
              </button>
            ))}
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Custom $"
              value={customTip}
              disabled={isAlreadyPaid}
              onChange={(e) => {
                setCustomTip(e.target.value);
                setTipPercent(0);
              }}
              className="bg-neutral-950 border border-neutral-700 px-2 py-1.5 rounded-lg text-xs text-center text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
        </div> */}

        {/* 4. SPLIT BILL & WAITER ASSISTANCE BAR */}
        <div className="grid grid-cols-2 gap-3">
          {/* <button
            type="button"
            onClick={() =>
              router.push(
                `/checkout/split?order=${encodeURIComponent(orderId)}&table=${encodeURIComponent(activeTable)}`
              )
            }
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300 transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-yellow-400" />
            <span>Split Bill with Table</span>
          </button> */}

          <button
            type="button"
            onClick={handleCallWaiter}
            disabled={isCallingWaiter}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300 transition cursor-pointer disabled:opacity-50"
          >
            <BellRing className={`w-4 h-4 text-amber-400 ${isCallingWaiter ? 'animate-spin' : ''}`} />
            <span>{isCallingWaiter ? 'Alerting...' : 'Call Waiter for Help'}</span>
          </button>
        </div>

        {/* 5. CHOOSE PAYMENT METHOD */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-white/80 text-xs font-semibold font-montserrat uppercase tracking-wider">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              disabled={isAlreadyPaid}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2.5 transition cursor-pointer text-xs font-montserrat ${
                paymentMethod === 'CARD'
                  ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Stripe Card (Online)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              disabled={isAlreadyPaid}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2.5 transition cursor-pointer text-xs font-montserrat ${
                paymentMethod === 'CASH'
                  ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-zinc-400 hover:text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash at Table (Cashier)</span>
            </button>
          </div>
        </div>

        {/* 6. PAYMENT ACTION VIEW */}
        {paymentMethod === 'CARD' ? (
          <div className="flex flex-col gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <span className="text-xs font-semibold text-zinc-300 font-montserrat">
                Stripe Card Details
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Stripe Test Mode
              </span>
            </div>

            {stripeMountError ? (
              <div className="text-xs text-red-400 py-2">{stripeMountError}</div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <div
                  ref={cardElementRef}
                  className="w-full p-3 bg-neutral-900 border border-neutral-700/80 rounded-xl focus-within:border-yellow-400 transition min-h-[46px]"
                />
                <span className="text-[11px] text-zinc-500 font-mono">
                  Use standard Stripe test cards (e.g. 4242 4242 4242 4242, any future expiry, any 3 digits)
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={isProcessing || !isOrderConfirmed || isAlreadyPaid || stripeLoading}
              onClick={handleStripePay}
              className="w-full mt-2 py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Processing with Stripe...</span>
                </>
              ) : isAlreadyPaid ? (
                <span>Payment Already Settled</span>
              ) : (
                <span>Pay {currencySymbol}{finalTotalDue.toFixed(2)} with Stripe</span>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <div className="flex flex-col">
                <span className="text-white text-xs font-semibold font-montserrat">
                  Offline Cash Collection
                </span>
                <span className="text-zinc-400 text-[11px] font-poppins">
                  Our waitstaff or cashier will come to your table to collect physical cash.
                </span>
              </div>
            </div>

            {cashRequestPending ? (
              <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-xl flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-yellow-400 animate-spin shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="text-yellow-300 font-semibold font-montserrat">
                    Request Submitted to Cashier
                  </span>
                  <span className="text-zinc-300 font-inter text-[11px]">
                    Reference <span className="font-mono font-bold">{cashRequestRef}</span>. Please keep this screen open. When the cashier confirms cash receipt, your session will automatically finalize.
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessing || !isOrderConfirmed || isAlreadyPaid}
                onClick={handleCashRequest}
                className="w-full mt-1 py-3.5 bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-[#0B0B0B] text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Submitting Request...</span>
                  </>
                ) : isAlreadyPaid ? (
                  <span>Payment Already Settled</span>
                ) : (
                  <span>Request Cash Payment at Table ({currencySymbol}{finalTotalDue.toFixed(2)})</span>
                )}
              </button>
            )}
          </div>
        )}
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

