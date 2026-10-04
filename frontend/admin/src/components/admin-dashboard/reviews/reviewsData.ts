import { CustomerReviewItem, ReviewsSummaryData } from './types';

export const INITIAL_REVIEWS_SUMMARY: ReviewsSummaryData = {
  totalReviews: '10.0k',
  growthPercentage: '21%',
  averageRating: '4.2',
  repliedCount: 5,
  pendingCount: 4,
  distribution: [
    { stars: 5, countStr: '2.0k', count: 2000, percentage: 65, colorClass: 'bg-emerald-500' },
    { stars: 4, countStr: '1.0k', count: 1000, percentage: 50, colorClass: 'bg-emerald-400' },
    { stars: 3, countStr: '500', count: 500, percentage: 32, colorClass: 'bg-yellow-400' },
    { stars: 2, countStr: '200', count: 200, percentage: 18, colorClass: 'bg-orange-400' },
    { stars: 1, countStr: '0k', count: 40, percentage: 6, colorClass: 'bg-red-400' },
  ],
};

export const REVIEW_CATEGORIES = [
  'All',
  'Food Quality',
  'Service',
  'Wait Time',
  'Ambiance',
  'Digital Experience',
  'Staff',
  'Special Occasion',
];

export const INITIAL_REVIEWS: CustomerReviewItem[] = [
  {
    id: 'rev-101',
    author: 'David L.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    timeMeta: 'Today, 1:45 PM · T-03 · #10481',
    rating: 5,
    reviewText:
      'Loved the digital QR ordering experience — so seamless and modern. The Chicken Pizza was absolutely delicious. Great atmosphere too!',
    tags: ['Digital Experience', 'Food Quality'],
    helpfulCount: 8,
    isHelpful: false,
    status: 'pending',
  },
  {
    id: 'rev-102',
    author: 'Sarah M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    timeMeta: 'Today, 2:30 PM · T-08 · #10482',
    rating: 5,
    reviewText:
      'Amazing food and incredibly quick service. The Classic Burger was perfectly cooked and the staff was so attentive. Will definitely be back!',
    tags: ['Food Quality', 'Service'],
    helpfulCount: 12,
    isHelpful: true,
    status: 'replied',
    replyText:
      "Thank you so much, Sarah! We're thrilled you loved your experience. Looking forward to your next visit!",
    repliedAt: 'Today, 3:15 PM',
  },
  {
    id: 'rev-103',
    author: 'Michael T.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    timeMeta: 'Today, 2:30 PM · T-08 · #10482',
    rating: 5,
    reviewText:
      "Best Caesar Salad I've had in this city. Fresh ingredients, perfect dressing. The service was excellent — our waiter Jake was super attentive.",
    tags: ['Food Quality', 'Staff'],
    helpfulCount: 14,
    isHelpful: false,
    status: 'replied',
    replyText:
      "Wonderful to hear this, Michael! Jake is one of our best — we'll pass along the kind words!",
    repliedAt: 'Today, 3:45 PM',
  },
  {
    id: 'rev-104',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    timeMeta: 'Yesterday, 8:10 PM · T-12 · #10469',
    rating: 4,
    reviewText:
      'The truffle pasta and signature cocktails were top tier. We had a slight delay during peak hours for our table, but the staff was courteous.',
    tags: ['Food Quality', 'Wait Time', 'Special Occasion'],
    helpfulCount: 6,
    isHelpful: false,
    status: 'pending',
  },
  {
    id: 'rev-105',
    author: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    timeMeta: 'Jul 28, 2025 · T-05 · #10452',
    rating: 5,
    reviewText:
      'Celebrated our anniversary here. The lighting, music playlist, and private booth ambiance created the perfect evening. Thank you Tavonza team!',
    tags: ['Ambiance', 'Special Occasion', 'Service'],
    helpfulCount: 19,
    isHelpful: true,
    status: 'replied',
    replyText:
      'Happy Anniversary Marcus! It was an honor hosting your special evening. Here is to many more celebrations together!',
    repliedAt: 'Jul 29, 2025',
  },
];
