'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackService, FeedbackRecord } from '@/redux/features/feedbackApi';
import { getActiveCustomerOrder, orderService } from '@/redux/features/orderApi';
import { getCookie } from '@/redux/api/baseApi';

interface FeedbackModalProps {
  onClose: () => void;
  onGoHome?: () => void;
  orderId?: string;
}

export default function FeedbackModal({ onClose, onGoHome, orderId: propOrderId }: FeedbackModalProps) {
  const [orderId, setOrderId] = useState<string>(propOrderId || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<FeedbackRecord | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveAndCheckFeedback() {
      try {
        let currentOrderId = propOrderId || orderId;

        if (!currentOrderId) {
          const cookieOrderId = getCookie('tavonza_last_submitted_order_id') || getCookie('tavonza_active_order_id');
          if (cookieOrderId) {
            currentOrderId = cookieOrderId.trim();
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
          const feedback = await feedbackService.getFeedbackByOrder(currentOrderId);
          if (isMounted && feedback) {
            setExistingFeedback(feedback);
            setRating(feedback.rating || 5);
            if (feedback.comment) {
              setFeedbackText(feedback.comment);
            }
          }
        }
      } catch (err) {
        console.warn('Error resolving feedback for modal:', err);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    resolveAndCheckFeedback();

    return () => {
      isMounted = false;
    };
  }, [propOrderId]);

  const handleSubmit = async () => {
    if (!orderId) {
      toast.error('No order detected for feedback.');
      onClose();
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
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submit review error:', err);
      toast.error(err?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackHome = () => {
    if (onGoHome) onGoHome();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-black min-h-screen md:min-h-0 md:rounded-[32px] border border-white/10 shadow-2xl relative flex flex-col justify-between overflow-x-hidden p-6 pb-10">
        {!isSubmitted ? (
          /* STEP 1: FEEDBACK & RATING FORM */
          <div className="w-full flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-6">
              {/* Header Title with Back Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-[20px] bg-amber-500/40 hover:bg-amber-500/60 border border-white/10 flex items-center justify-center text-white transition shrink-0 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <h2 className="text-2xl font-semibold text-white font-['Montserrat']">FeedBack</h2>
              </div>

              {/* Already reviewed banner */}
              {existingFeedback && !isChecking && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex flex-col text-xs font-['Montserrat']">
                    <span className="text-white font-semibold">Review Already Recorded</span>
                    <span className="text-amber-200/80">
                      You previously rated this order {existingFeedback.rating} stars. Thank you!
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-medium text-white font-['Poppins'] tracking-wide">
                  {existingFeedback ? 'Your Dining Review' : 'How Was Your Experience?'}
                </h3>
                <p className="text-sm text-stone-200 font-['Montserrat'] leading-6">
                  {existingFeedback
                    ? 'Here is your recorded rating for this order.'
                    : "We'd love to hear your feedback."}
                </p>
              </div>

              {/* 5-Star Interactive Rating */}
              <div className="flex flex-col items-center gap-2 py-4 bg-neutral-900/60 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const activeRating = hoverRating !== null ? hoverRating : rating;
                    const isFilled = starIdx <= activeRating;
                    return (
                      <button
                        key={starIdx}
                        type="button"
                        disabled={Boolean(existingFeedback)}
                        onMouseEnter={() => !existingFeedback && setHoverRating(starIdx)}
                        onMouseLeave={() => !existingFeedback && setHoverRating(null)}
                        onClick={() => !existingFeedback && setRating(starIdx)}
                        className={`p-1 transition-transform ${
                          existingFeedback ? 'cursor-default' : 'hover:scale-125 cursor-pointer'
                        } focus:outline-none`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? 'text-amber-500 fill-amber-500 stroke-amber-500'
                              : 'text-neutral-700 fill-transparent stroke-amber-500/50'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-sm font-medium text-orange-400 font-['DM_Sans']">
                  {hoverRating !== null
                    ? `Rate (${hoverRating} Star${hoverRating > 1 ? 's' : ''})`
                    : rating > 0
                    ? `Rated ${rating} Star${rating > 1 ? 's' : ''}`
                    : 'Rate'}
                </span>
              </div>

              {/* Feedback Text Area */}
              <div className="flex flex-col gap-2.5">
                <label className="text-base font-semibold text-white font-['Montserrat']">
                  Your Feedback
                </label>
                <div className="w-full h-24 p-3.5 bg-neutral-900 border border-white/10 rounded-[10px] flex items-start gap-2.5 overflow-hidden focus-within:border-amber-500 transition">
                  <textarea
                    rows={3}
                    readOnly={Boolean(existingFeedback)}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={
                      existingFeedback
                        ? 'No additional feedback text recorded.'
                        : 'Share your experience..........'
                    }
                    className={`w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-['Montserrat'] focus:outline-none resize-none leading-relaxed ${
                      existingFeedback ? 'opacity-80 cursor-default' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5 pt-4">
              {existingFeedback ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-semibold font-['Montserrat'] leading-5 rounded-2xl transition active:scale-[0.99] flex items-center justify-center cursor-pointer"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting || isChecking}
                    onClick={handleSubmit}
                    className="w-full h-12 bg-orange-400 hover:bg-orange-300 disabled:opacity-60 text-neutral-950 text-lg font-semibold font-['Montserrat'] leading-5 rounded-2xl shadow-[0px_8px_20px_0px_rgba(227,172,56,0.35)] transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-center text-white text-sm font-medium font-['DM_Sans'] leading-5 hover:underline transition py-1 cursor-pointer"
                  >
                    Skip
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: THANK YOU SUCCESS SCREEN */
          <div className="w-full flex-1 flex flex-col justify-between items-center text-center animate-in fade-in duration-300 py-12">
            <div />

            <div className="flex flex-col items-center gap-4">
              {/* Success Amber Checkmark Icon */}
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/20 mb-2">
                <CheckCircle2 className="w-9 h-9 text-amber-500 stroke-[1.8]" />
              </div>

              {/* Headline */}
              <h2 className="text-xl font-medium text-white font-['Poppins'] leading-6 tracking-wide">
                Thank You
              </h2>

              {/* Success Message */}
              <p className="text-stone-200 text-sm font-normal font-['Montserrat'] leading-6 max-w-xs">
                Your feedback was submitted successfully. We appreciate your valuable time!
              </p>
            </div>

            {/* Back To Home Button */}
            <button
              type="button"
              onClick={handleBackHome}
              className="w-full h-12 bg-orange-400 hover:bg-orange-300 text-neutral-950 text-lg font-semibold font-['Montserrat'] leading-5 rounded-2xl shadow-[0px_8px_20px_0px_rgba(227,172,56,0.35)] transition active:scale-[0.99] flex items-center justify-center mt-auto cursor-pointer"
            >
              Back To Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
