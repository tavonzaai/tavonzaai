import { Injectable, Logger } from '@nestjs/common';
import {
  FifoQueue,
  QUEUE_NAMES,
  EmailJobPayload,
  SESEmailDispatcher,
} from '@tavonza/queue';
import {
  renderVerificationEmail,
  renderPasswordResetEmail,
  renderTestEmail,
} from './email-templates';

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  queued: boolean;
  devOtp?: string;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private emailQueue: FifoQueue<EmailJobPayload> | null = null;
  private sesDispatcher: SESEmailDispatcher;

  constructor() {
    this.sesDispatcher = new SESEmailDispatcher();
    try {
      this.emailQueue = new FifoQueue<EmailJobPayload>(QUEUE_NAMES.EMAIL);
    } catch (err: any) {
      this.logger.warn(`Could not connect email queue to Redis: ${err.message}. Will use direct SES dispatch.`);
    }
  }

  /**
   * Dispatches email verification OTP (for account creation & resend)
   */
  async sendVerificationCode(to: string, firstName: string, code: string): Promise<SendMailResult> {
    const { html, text } = renderVerificationEmail(firstName, code);
    const subject = `Your Tavonza AI Verification Code: ${code}`;

    this.logDevBanner('Email Verification OTP', to, code);

    return this.dispatchEmail({
      to,
      subject,
      html,
      text,
      metadata: { type: 'email_verification', code },
    }, code);
  }

  /**
   * Dispatches password reset OTP
   */
  async sendPasswordResetCode(to: string, firstName: string, code: string): Promise<SendMailResult> {
    const { html, text } = renderPasswordResetEmail(firstName, code);
    const subject = `Reset Your Tavonza AI Password (Code: ${code})`;

    this.logDevBanner('Password Reset OTP', to, code);

    return this.dispatchEmail({
      to,
      subject,
      html,
      text,
      metadata: { type: 'password_reset', code },
    }, code);
  }

  /**
   * Dispatches custom test email
   */
  async sendTestEmail(to: string, customSubject?: string, customMessage?: string): Promise<SendMailResult> {
    const { html, text } = renderTestEmail(to, customMessage);
    const subject = customSubject || '🚀 Tavonza AI Mail Service Test';

    this.logger.log(`Dispatching test email to: ${to}`);

    return this.dispatchEmail({
      to,
      subject,
      html,
      text,
      metadata: { type: 'manual_test' },
    });
  }

  /**
   * General dispatch: routes into Redis FIFO Queue if available, otherwise direct SES
   */
  private async dispatchEmail(payload: EmailJobPayload, devOtp?: string): Promise<SendMailResult> {
    // 1. Try to enqueue into Redis FIFO Queue
    if (this.emailQueue) {
      try {
        const job = await this.emailQueue.enqueue('send-email', payload);
        this.logger.log(`Enqueued email job [${job.id}] to "${QUEUE_NAMES.EMAIL}" (FIFO)`);
        return {
          success: true,
          messageId: `queued-job-${job.id}`,
          queued: true,
          devOtp: process.env.NODE_ENV !== 'production' ? devOtp : undefined,
        };
      } catch (queueErr: any) {
        this.logger.warn(`Redis queue push failed (${queueErr.message}), falling back to direct SES dispatch`);
      }
    }

    // 2. Direct SES Dispatch fallback
    try {
      const result = await this.sesDispatcher.send(payload);
      return {
        success: true,
        messageId: result.messageId,
        queued: false,
        devOtp: process.env.NODE_ENV !== 'production' ? devOtp : undefined,
      };
    } catch (sesErr: any) {
      this.logger.error(`Direct SES dispatch failed: ${sesErr.message}`, sesErr.stack);
      return {
        success: false,
        queued: false,
        error: sesErr.message,
        devOtp: process.env.NODE_ENV !== 'production' ? devOtp : undefined,
      };
    }
  }

  /**
   * Pretty console logger for local development
   */
  private logDevBanner(title: string, to: string, code: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n' + '─'.repeat(60));
      console.log(`✉️  [LOCAL DEV OTP] ${title}`);
      console.log(`   Recipient: ${to}`);
      console.log(`   OTP Code:  👉 ${code} 👈`);
      console.log(`   Expires:   10 minutes`);
      console.log('─'.repeat(60) + '\n');
    }
  }

  /**
   * Health and configuration status
   */
  async getStatus() {
    let queueStatus = 'offline';
    let jobCounts = null;

    if (this.emailQueue) {
      try {
        jobCounts = await this.emailQueue.getJobCounts();
        queueStatus = 'connected';
      } catch {
        queueStatus = 'unreachable';
      }
    }

    return {
      environment: process.env.NODE_ENV || 'development',
      awsRegion: process.env.AWS_REGION || 'eu-west-2',
      redisConfigured: !!process.env.REDIS_URL,
      queueStatus,
      jobCounts,
      defaultFrom: process.env.SMTP_FROM || process.env.MAIL_FROM_ADDRESS || 'noreply@tavonza.com',
    };
  }
}
