/**
 * Responsive HTML Email Templates for Tavonza AI
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #0d1117;
  color: #c9d1d9;
  margin: 0;
  padding: 40px 20px;
`;

const CARD_STYLES = `
  max-width: 540px;
  margin: 0 auto;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 36px 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const LOGO_BADGE = `
  display: inline-block;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
`;

const OTP_BOX_STYLES = `
  background: #0d1117;
  border: 2px dashed #6366f1;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin: 28px 0;
`;

const OTP_CODE_STYLES = `
  font-family: 'Courier New', Courier, monospace;
  font-size: 38px;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 10px;
  margin: 0;
`;

const FOOTER_STYLES = `
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #30363d;
  font-size: 12px;
  color: #8b949e;
  line-height: 1.5;
`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

export function renderVerificationEmail(firstName: string, otpCode: string): { html: string; text: string } {
  const safeFirstName = escapeHtml(firstName || 'Valued Customer');
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your Tavonza AI Account</title>
      </head>
      <body style="${BASE_STYLES}">
        <div style="${CARD_STYLES}">
          <div style="${LOGO_BADGE}">Tavonza AI</div>
          <h1 style="font-size: 22px; color: #f0f6fc; margin: 0 0 16px 0;">Verify your email address</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #8b949e; margin: 0 0 20px 0;">
            Hello ${safeFirstName},<br/>
            Thank you for registering with Tavonza AI. Please use the 5-digit verification code below to confirm your account:
          </p>
          
          <div style="${OTP_BOX_STYLES}">
            <p style="${OTP_CODE_STYLES}">${otpCode}</p>
            <span style="font-size: 12px; color: #8b949e; display: block; margin-top: 8px;">Valid for 10 minutes</span>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #8b949e;">
            Enter this code on the verification screen to activate your account. If you did not create this account, you can safely ignore this email.
          </p>

          <div style="${FOOTER_STYLES}">
            &copy; ${new Date().getFullYear()} Tavonza AI Restaurant Platform. All rights reserved.<br/>
            This is an automated security transmission. Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Tavonza AI - Verify Your Account

Hello ${firstName || 'Valued Customer'},
Your 5-digit verification code is: ${otpCode}

This code expires in 10 minutes.
If you did not request this, please ignore this message.
  `.trim();

  return { html, text };
}

export function renderPasswordResetEmail(firstName: string, otpCode: string): { html: string; text: string } {
  const safeFirstName = escapeHtml(firstName || 'there');
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset your Tavonza AI Password</title>
      </head>
      <body style="${BASE_STYLES}">
        <div style="${CARD_STYLES}">
          <div style="${LOGO_BADGE}">Tavonza AI Security</div>
          <h1 style="font-size: 22px; color: #f0f6fc; margin: 0 0 16px 0;">Password Reset Request</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #8b949e; margin: 0 0 20px 0;">
            Hello ${safeFirstName},<br/>
            We received a request to reset your password for your Tavonza AI account. Use the authorization code below:
          </p>
          
          <div style="${OTP_BOX_STYLES}">
            <p style="${OTP_CODE_STYLES}">${otpCode}</p>
            <span style="font-size: 12px; color: #8b949e; display: block; margin-top: 8px;">Valid for 10 minutes</span>
          </div>

          <p style="font-size: 14px; line-height: 1.5; color: #8b949e;">
            Never share this code with anyone. Tavonza AI staff will never ask for your verification code. If you did not request a password reset, please change your credentials immediately.
          </p>

          <div style="${FOOTER_STYLES}">
            &copy; ${new Date().getFullYear()} Tavonza AI Restaurant Platform.<br/>
            Security Notification
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Tavonza AI - Password Reset Request

Hello ${firstName || 'there'},
Your password reset OTP code is: ${otpCode}

This code expires in 10 minutes. Never share this code with anyone.
  `.trim();

  return { html, text };
}

export function renderTestEmail(to: string, customMessage?: string): { html: string; text: string } {
  const message = customMessage || 'This is a test email sent from the Tavonza AI Mail Service & AWS SES integration.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Tavonza AI Mail Service Test</title>
      </head>
      <body style="${BASE_STYLES}">
        <div style="${CARD_STYLES}">
          <div style="${LOGO_BADGE}">SES Test</div>
          <h1 style="font-size: 20px; color: #f0f6fc; margin: 0 0 16px 0;">AWS SES & Redis FIFO Mailer Working! 🚀</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #8b949e; margin: 0 0 20px 0;">
            ${message}
          </p>
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 14px; font-size: 13px; color: #58a6ff;">
            <strong>Target Recipient:</strong> ${to}<br/>
            <strong>Timestamp:</strong> ${new Date().toISOString()}<br/>
            <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
          </div>
          <div style="${FOOTER_STYLES}">
            Tavonza AI Diagnostic Tool
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Tavonza AI Mail Service Test
${message}
Recipient: ${to}
Timestamp: ${new Date().toISOString()}
  `.trim();

  return { html, text };
}
