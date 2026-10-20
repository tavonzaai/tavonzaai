import { baseApiFetch } from '../api/baseApi';

export interface TestSendMailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface TestOtpMailPayload {
  to: string;
  code: string;
  name?: string;
}

export interface MailStatusResponse {
  connected: boolean;
  provider: string;
  queueStatus?: {
    waiting: number;
    active: number;
    failed: number;
  };
}

export const mailService = {
  /**
   * POST /mail/test-send
   * Tests custom email dispatch via configured mailer/SES transport.
   */
  testSend: async (payload: TestSendMailPayload): Promise<{ success: boolean; messageId?: string }> => {
    const res = await baseApiFetch<{ success: boolean; messageId?: string }>('/mail/test-send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /mail/test-otp
   * Tests OTP verification email template dispatch.
   */
  testOtp: async (payload: TestOtpMailPayload): Promise<{ success: boolean; messageId?: string }> => {
    const res = await baseApiFetch<{ success: boolean; messageId?: string }>('/mail/test-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /mail/status
   * Checks mail queue connectivity and SES service health.
   */
  getStatus: async (): Promise<MailStatusResponse> => {
    const res = await baseApiFetch<MailStatusResponse>('/mail/status', {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },
};
