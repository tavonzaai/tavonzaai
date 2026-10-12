import { baseApiFetch } from '../api/baseApi';

export interface SubmitFeedbackPayload {
  orderId: string;
  rating: number; // 1 to 5
  comment?: string;
  customerId?: string;
}

export interface FeedbackRecord {
  id: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  isApproved?: boolean;
  createdAt: string;
  updatedAt?: string;
  message?: string;
}

export const feedbackService = {
  /**
   * POST /feedback
   * [Customer] Submit order feedback and rating
   */
  submitFeedback: async (payload: SubmitFeedbackPayload): Promise<FeedbackRecord> => {
    const cleanOrderId = (payload.orderId || '').trim();
    if (!cleanOrderId) {
      throw new Error('Valid orderId is required to submit feedback');
    }

    const body: Record<string, any> = {
      orderId: cleanOrderId,
      rating: Math.min(5, Math.max(1, Number(payload.rating) || 5)),
    };

    if (payload.comment && payload.comment.trim()) {
      body.comment = payload.comment.trim();
    }
    if (payload.customerId && payload.customerId.trim()) {
      body.customerId = payload.customerId.trim();
    }

    const res = await baseApiFetch<FeedbackRecord>('/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return (res as any)?.data || res;
  },

  /**
   * GET /feedback/order/:orderId
   * [Customer] Get feedback for an order
   */
  getFeedbackByOrder: async (orderId: string): Promise<FeedbackRecord | null> => {
    const cleanOrderId = (orderId || '').trim();
    if (!cleanOrderId) return null;

    try {
      const res = await baseApiFetch<FeedbackRecord | null>(
        `/feedback/order/${encodeURIComponent(cleanOrderId)}`,
        {
          method: 'GET',
        }
      );
      const data = (res as any)?.data !== undefined ? (res as any).data : res;
      return data || null;
    } catch (err) {
      console.warn(`Feedback query for order ${cleanOrderId} returned error:`, err);
      return null;
    }
  },
};
