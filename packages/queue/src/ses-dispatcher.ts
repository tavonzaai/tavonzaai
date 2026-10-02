import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { EmailJobPayload } from './types.js';

export interface SESDispatcherConfig {
  region?: string;
  defaultFrom?: string;
  configurationSetName?: string;
}

export class SESEmailDispatcher {
  private client: SESv2Client | null = null;
  private defaultFrom: string;
  private configurationSetName?: string;
  private isDryRun: boolean;

  constructor(config?: SESDispatcherConfig) {
    const region = config?.region || process.env.AWS_REGION || 'eu-west-2';
    this.defaultFrom =
      config?.defaultFrom ||
      process.env.SMTP_FROM ||
      process.env.MAIL_FROM_ADDRESS ||
      'noreply@tavonza.com';
    this.configurationSetName =
      config?.configurationSetName || process.env.SES_CONFIGURATION_SET;

    // Detect if we should dry-run (e.g. local dev without real AWS credentials)
    const hasStaticCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    const isLocalDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (isLocalDev && !hasStaticCreds && !process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) {
      this.isDryRun = true;
      console.log('ℹ️ [SESEmailDispatcher] No AWS credentials detected in development. Running in DRY-RUN mode (mock).');
    } else {
      this.isDryRun = false;
      this.client = new SESv2Client({
        region,
        ...(hasStaticCreds && {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        }),
      });
    }
  }

  /**
   * Dispatches an email job via AWS SES v2.
   */
  async send(payload: EmailJobPayload): Promise<{ success: boolean; messageId?: string }> {
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const fromAddress = payload.from || this.defaultFrom;

    if (this.isDryRun || !this.client) {
      const mockId = `mock-ses-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      console.log(`[SES Dry-Run] Email dispatched successfully:`, {
        from: fromAddress,
        to: recipients,
        subject: payload.subject,
        messageId: mockId,
      });
      return { success: true, messageId: mockId };
    }

    const commandInput: SendEmailCommandInput = {
      FromEmailAddress: fromAddress,
      Destination: {
        ToAddresses: recipients,
      },
      ReplyToAddresses: payload.replyTo,
      Content: {
        Simple: {
          Subject: {
            Data: payload.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: payload.html,
              Charset: 'UTF-8',
            },
            ...(payload.text && {
              Text: {
                Data: payload.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      },
    };

    const configSet = payload.configurationSetName || this.configurationSetName;
    if (configSet) {
      commandInput.ConfigurationSetName = configSet;
    }

    if (payload.tags) {
      commandInput.EmailTags = Object.entries(payload.tags).map(([Name, Value]) => ({
        Name,
        Value,
      }));
    }

    const command = new SendEmailCommand(commandInput);
    const response = await this.client.send(command);

    console.log(`[SESEmailDispatcher] Email sent to ${recipients.join(', ')} (Message ID: ${response.MessageId})`);

    return {
      success: true,
      messageId: response.MessageId,
    };
  }
}
