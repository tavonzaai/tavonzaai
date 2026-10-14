'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Star, HeartHandshake, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';
import { feedbackService, FeedbackRecord } from '@/redux/features/feedbackApi';
import { getActiveCustomerOrder, orderService } from '@/redux/features/orderApi';

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  const [orderId, setOrderId] = useState<string>(() => {
    return (searchParams.get('order') || searchParams.get('orderId') || searchParams.get('id') || '').trim();
  });

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<FeedbackRecord | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Resolve orderId if missing & fetch existing feedback
  useEffect(() => {
    let isMounted = true;

    async function initOrderAndFeedback() {
      try {
        let currentOrderId = orderId;

        // If no orderId in query, fallback to local storage or active customer orders
        if (!currentOrderId) {
          if (typeof window !== 'undefined') {
            const lastSubmitted =
              localStorage.getItem('tavonza_last_submitted_order_id') ||
              sessionStorage.getItem('tavonza_last_submitted_order_id') ||
              '';
            if (lastSubmitted) {
              currentOrderId = lastSubmitted.trim();
            }
          }

          if (!currentOrderId) {
            const active = await getActiveCustomerOrder().catch(() => null);
            if (active && (active.orderId || active.id)) {
              currentOrderId = (active.orderId || active.id).trim();
            }
          }

          if (!currentOrderId) {
            const myOrders = await orderService.getMyOrders().catch(() => []);
            if (myOrders && myOrders.length > 0) {
              const latest = myOrders[0];
              if (latest && (latest.orderId || latest.id)) {
                currentOrderId = (latest.orderId || latest.id).trim();
              }
            }
          }

          if (currentOrderId && isMounted) {
            setOrderId(currentOrderId);
          }
        }

        // If we have an orderId, check if feedback was already submitted
        if (currentOrderId) {
          const recorded = await feedbackService.getFeedbackByOrder(currentOrderId);
          if (isMounted && recorded) {
            setExistingFeedback(recorded);
            setRating(recorded.rating || 5);
            if (recorded.comment) {
              setFeedbackText(recorded.comment);
            }
          }
        }
      } catch (err) {
        console.warn('Could not check existing feedback:', err);
      } finally {
        if (isMounted) {
          setIsCheckingExisting(false);
        }
      }
    }

    initOrderAndFeedback();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId) {
      toast.error('No order detected for feedback. Please place an order first or scan a table QR code.');
      router.push(`/menu?table=${encodeURIComponent(activeTable)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await feedbackService.submitFeedback({
        orderId,
        rating,
        comment: feedbackText,
      });

      toast.success('Your feedback was submitted successfully!');
      router.push(
        `/feedback/thank-you?table=${encodeURIComponent(activeTable)}&rating=${rating}&order=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (err: any) {
      console.error('Submit feedback failed:', err);
      toast.error(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide1.jpg"
      imageAlt="Tavonza Hospitality"
      badgeText="Your Voice Matters"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          How Was Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Dining Experience?
          </span>
        </h1>
      }
      subheadline="Every dish is crafted with passion. Your feedback directly shapes our culinary innovation and service excellence."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Customer Satisfaction</span>
              <span className="text-yellow-400 text-sm font-bold">Your opinion is valued</span>
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Table {activeTable}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Header */}
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
              Feedback
            </h1>
          </div>

          <span className="text-xs text-zinc-400 font-montserrat">
            {activeTable}
          </span>
        </header>

        {/* Existing review notice banner if already reviewed */}
        {existingFeedback && !isCheckingExisting && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex flex-col text-xs font-montserrat">
              <span className="text-white font-semibold">Review Already Recorded</span>
              <span className="text-amber-200/80">
                You previously rated this order {existingFeedback.rating} stars. Thank you for your review!
              </span>
            </div>
          </div>
        )}

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-lg font-semibold font-poppins tracking-wide">
            {existingFeedback ? 'Your Experience Rating' : 'Rate Your Visit'}
          </h2>
          <p className="text-[#ECE4D1] text-xs font-montserrat font-normal leading-relaxed">
            {existingFeedback
              ? 'Here is the rating and feedback you shared for this dining session.'
              : "We'd love to hear how we did today."}
          </p>
        </div>

        {/* 5-STAR RATING SELECTOR */}
        <div className="flex flex-col items-center justify-center gap-2 py-5 bg-neutral-900/70 rounded-2xl border border-neutral-800 shadow-md">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  disabled={Boolean(existingFeedback)}
                  onMouseEnter={() => !existingFeedback && setHoverRating(star)}
                  onMouseLeave={() => !existingFeedback && setHoverRating(0)}
                  onClick={() => !existingFeedback && setRating(star)}
                  className={`p-1 transition-transform ${
                    existingFeedback ? 'cursor-default' : 'active:scale-110 cursor-pointer'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                      isFilled
                        ? 'fill-[#FFD60A] text-[#FFD60A] drop-shadow-[0_0_8px_rgba(255,214,10,0.6)]'
                        : 'text-neutral-600 fill-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-white text-xs font-medium font-montserrat">
            Rated {rating} of 5 Stars
          </span>
        </div>

        {/* FEEDBACK TEXTAREA */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-xs font-medium font-montserrat">
            {existingFeedback ? 'Your Comments' : 'Your Comments (Optional)'}
          </label>
          <textarea
            rows={4}
            value={feedbackText}
            readOnly={Boolean(existingFeedback)}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              existingFeedback
                ? 'No additional comments provided.'
                : 'Tell us what you loved, or how we can improve...'
            }
            className={`w-full bg-[#181818] border border-neutral-800 rounded-xl p-3.5 text-white placeholder:text-zinc-500 text-xs sm:text-sm font-inter focus:outline-none transition resize-none ${
              existingFeedback ? 'opacity-80 cursor-default' : 'focus:border-amber-400'
            }`}
          />
        </div>

        {/* SUBMIT BUTTON OR BACK TO MENU */}
        <div className="pt-1">
          {existingFeedback ? (
            <button
              type="button"
              onClick={() => router.push(`/menu?table=${encodeURIComponent(activeTable)}`)}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-[0.99] text-white text-sm sm:text-base font-semibold font-inter rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              Back to Menu
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || isCheckingExisting}
              className="w-full py-3.5 bg-[#FFD60A] hover:bg-yellow-300 disabled:opacity-60 active:scale-[0.99] text-black text-sm sm:text-base font-semibold font-inter rounded-xl shadow-[0px_8px_20px_rgba(227,172,56,0.25)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          )}
        </div>
      </form>
    </DesktopSplitLayout>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
