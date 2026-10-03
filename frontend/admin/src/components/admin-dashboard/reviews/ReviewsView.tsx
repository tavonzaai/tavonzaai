'use client';

import React, { useState, useMemo } from 'react';
import {
  ReviewsHeader,
  ReviewsSummaryKPIs,
  ReviewsFilterBar,
  ReviewsList,
} from './components';
import { INITIAL_REVIEWS, INITIAL_REVIEWS_SUMMARY } from './reviewsData';
import { CustomerReviewItem, ReviewsSummaryData } from './types';
import { CheckCircle } from 'lucide-react';

export default function ReviewsView() {
  const [reviews, setReviews] = useState<CustomerReviewItem[]>(INITIAL_REVIEWS);
  const [selectedStars, setSelectedStars] = useState<number | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'replied' | 'pending'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic Summary Metrics
  const summary = useMemo<ReviewsSummaryData>(() => {
    const repliedCount = reviews.filter((r) => r.status === 'replied').length;
    const pendingCount = reviews.filter((r) => r.status === 'pending').length;

    return {
      ...INITIAL_REVIEWS_SUMMARY,
      repliedCount,
      pendingCount,
    };
  }, [reviews]);

  // Filtered reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Star filter
      const matchesStars = selectedStars === 'All' || r.rating === selectedStars;

      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || r.tags.includes(selectedCategory);

      // Status filter
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      // Search query
      const matchesSearch =
        r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.replyText && r.replyText.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStars && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [reviews, selectedStars, selectedCategory, statusFilter, searchQuery]);

  // Post reply handler
  const handlePostReply = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'replied',
              replyText,
              repliedAt: 'Just now',
            }
          : r
      )
    );

    const target = reviews.find((r) => r.id === reviewId);
    showToast(`Reply posted to ${target ? target.author : 'customer'} successfully!`);
  };

  // Toggle helpful counter handler
  const handleToggleHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isNowHelpful = !r.isHelpful;
          return {
            ...r,
            isHelpful: isNowHelpful,
            helpfulCount: isNowHelpful ? r.helpfulCount + 1 : Math.max(0, r.helpfulCount - 1),
          };
        }
        return r;
      })
    );
  };

  const handleResetFilters = () => {
    setSelectedStars('All');
    setSelectedCategory('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, Date range) */}
      <ReviewsHeader />

      {/* 2. Top Summary KPI Cards (Total Reviews, Avg Rating, Replied/Pending, Rating Bars) */}
      <ReviewsSummaryKPIs summary={summary} />

      {/* 3. Filter Bar (Star Segmented Controls, Search Input, Status, Category Pills) */}
      <ReviewsFilterBar
        selectedStars={selectedStars}
        setSelectedStars={setSelectedStars}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={reviews.length}
      />

      {/* 4. Reviews Cards Feed */}
      <ReviewsList
        reviews={filteredReviews}
        onPostReply={handlePostReply}
        onToggleHelpful={handleToggleHelpful}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
