'use client';

import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { CustomerReviewItem } from '../types';
import { MessageSquareText, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewsListProps {
  reviews: CustomerReviewItem[];
  onPostReply: (reviewId: string, replyText: string) => void;
  onToggleHelpful: (reviewId: string) => void;
  onResetFilters?: () => void;
  itemsPerPage?: number;
}

export default function ReviewsList({
  reviews,
  onPostReply,
  onToggleHelpful,
  onResetFilters,
  itemsPerPage = 10,
}: ReviewsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews.length]);

  const totalPages = Math.ceil(reviews.length / itemsPerPage) || 1;
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, reviews.length);

  if (reviews.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-[#131417] border border-[#22242a] rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <MessageSquareText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white text-lg font-semibold">No reviews found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            No guest reviews match your selected star rating, category, or search keywords.
          </p>
        </div>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      {paginatedReviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onPostReply={onPostReply}
          onToggleHelpful={onToggleHelpful}
        />
      ))}

      {/* Pagination Footer (when more than itemsPerPage or multiple pages) */}
      {reviews.length > itemsPerPage && (
        <div className="py-4 px-6 bg-[#131417] border border-[#22242a] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 w-full shadow-lg">
          <div className="text-zinc-400 text-sm font-medium font-['Inter']">
            Showing <span className="text-white font-semibold">{startIdx}</span> to{' '}
            <span className="text-white font-semibold">{endIdx}</span> of{' '}
            <span className="text-white font-semibold">{reviews.length}</span> reviews
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-500 text-white font-bold shadow-sm shadow-yellow-500/20'
                      : 'bg-neutral-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
