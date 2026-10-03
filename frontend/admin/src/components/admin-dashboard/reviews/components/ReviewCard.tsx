'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, Reply, Sparkles, Check, MessageSquare } from 'lucide-react';
import { CustomerReviewItem } from '../types';

interface ReviewCardProps {
  review: CustomerReviewItem;
  onPostReply: (reviewId: string, replyText: string) => void;
  onToggleHelpful: (reviewId: string) => void;
}

export default function ReviewCard({
  review,
  onPostReply,
  onToggleHelpful,
}: ReviewCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState('');

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Digital Experience':
        return 'bg-green-700/20 text-neutral-300';
      case 'Food Quality':
        return 'bg-yellow-500/20 text-neutral-300';
      case 'Service':
        return 'bg-yellow-500/20 text-neutral-300';
      case 'Staff':
        return 'bg-yellow-950 text-neutral-300';
      case 'Wait Time':
        return 'bg-orange-950/40 text-neutral-300';
      case 'Ambiance':
        return 'bg-purple-950/40 text-neutral-300';
      case 'Special Occasion':
        return 'bg-rose-950/40 text-neutral-300';
      default:
        return 'bg-neutral-800 text-neutral-300';
    }
  };

  const handleGenerateAIReply = () => {
    const aiTemplates = [
      `Thank you so much, ${review.author.split(' ')[0]}! We're thrilled you loved your experience. Looking forward to your next visit!`,
      `Wonderful to hear this, ${review.author.split(' ')[0]}! We'll pass along the kind words to our kitchen and service team!`,
      `Thank you for dining with us, ${review.author.split(' ')[0]}. We appreciate your feedback and look forward to welcoming you back soon!`,
    ];
    const chosen = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
    setReplyInput(chosen);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    onPostReply(review.id, replyInput.trim());
    setIsReplying(false);
    setReplyInput('');
  };

  return (
    <div className="w-full p-6 bg-white/5 rounded-[10px] border border-white/10 backdrop-blur-[10.20px] flex flex-col justify-start items-start space-y-3.5 shadow-lg">
      {/* 1. Header: Avatar + Author info (Left) & 5 Gold Stars (Right) */}
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="flex flex-col">
            <h3 className="text-white text-sm font-bold font-['Inter'] leading-5">
              {review.author}
            </h3>
            <span className="text-gray-400 text-sm font-normal font-['Inter'] leading-4">
              {review.timeMeta}
            </span>
          </div>
        </div>

        {/* 5 Gold Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((st) => (
            <div key={st} className="size-3 relative flex items-center justify-center">
              <Star
                className={`w-2.5 h-2.5 ${
                  st <= review.rating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-zinc-700 fill-zinc-700'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Review Text */}
      <div className="w-full">
        <p className="text-zinc-300 text-sm font-normal font-['Inter'] leading-5">
          {review.reviewText}
        </p>
      </div>

      {/* 3. Category Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {review.tags.map((tag) => (
          <div
            key={tag}
            className={`px-2 py-0.5 rounded-sm inline-flex flex-col justify-start items-start ${getTagStyle(
              tag
            )}`}
          >
            <span className="text-neutral-300 text-xs font-semibold font-['Inter'] leading-4">
              {tag}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Replied Response Box (if already replied) */}
      {review.status === 'replied' && review.replyText && (
        <div className="w-full p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
          <div className="text-orange-600 text-sm font-bold font-['Inter'] leading-4">
            Your Response
          </div>
          <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-4">
            {review.replyText}
          </p>
        </div>
      )}

      {/* 5. Reply Composition Form (when replying) */}
      {isReplying && review.status === 'pending' && (
        <form onSubmit={handleSubmitReply} className="w-full space-y-2 pt-1 animate-in fade-in duration-150">
          <div className="w-full p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-400">Write a thoughtful reply...</span>
              <button
                type="button"
                onClick={handleGenerateAIReply}
                className="px-2 py-0.5 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Suggestion</span>
              </button>
            </div>
            <textarea
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Write a thoughtful reply..."
              rows={2}
              className="w-full p-2 bg-black/40 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500 resize-none font-['Inter']"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyInput('');
              }}
              className="px-3 py-1.5 text-gray-500 hover:text-white text-sm font-semibold font-['Inter'] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyInput.trim()}
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm font-['Inter'] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Post Reply
            </button>
          </div>
        </form>
      )}

      {/* 6. Footer: Helpful Counter & Reply to Review / Replied Indicator */}
      <div className="w-full pt-3 border-t-[1.25px] border-neutral-500/20 flex items-center justify-between">
        {/* Helpful counter button */}
        <button
          type="button"
          onClick={() => onToggleHelpful(review.id)}
          className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-white transition-colors"
        >
          <ThumbsUp
            className={`w-3.5 h-3.5 ${
              review.isHelpful ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
            }`}
          />
          <span className="text-gray-400 text-sm font-medium font-['Inter'] leading-4">
            Helpful ({review.helpfulCount})
          </span>
        </button>

        {/* Reply Trigger or Replied Status */}
        {review.status === 'replied' ? (
          <div className="text-green-600 text-sm font-semibold font-['Inter'] leading-4 flex items-center gap-1">
            <span>✓ Replied</span>
          </div>
        ) : (
          !isReplying && (
            <button
              type="button"
              onClick={() => {
                setIsReplying(true);
                handleGenerateAIReply();
              }}
              className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold font-['Inter'] leading-4 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Reply className="w-3.5 h-3.5 text-yellow-500" />
              <span>Reply to Review</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
