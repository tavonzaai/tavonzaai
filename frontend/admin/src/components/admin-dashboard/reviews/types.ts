export interface CustomerReviewItem {
  id: string;
  author: string;
  avatar: string;
  timeMeta: string; // e.g. "Today, 1:45 PM · T-03 · #10481"
  rating: number; // 1 to 5
  reviewText: string;
  tags: string[]; // e.g. ['Digital Experience', 'Food Quality']
  helpfulCount: number;
  isHelpful?: boolean;
  status: 'replied' | 'pending';
  replyText?: string;
  repliedAt?: string;
}

export interface RatingBarItem {
  stars: number;
  countStr: string;
  count: number;
  percentage: number;
  colorClass: string;
}

export interface ReviewsSummaryData {
  totalReviews: string;
  growthPercentage: string;
  averageRating: string;
  repliedCount: number;
  pendingCount: number;
  distribution: RatingBarItem[];
}
