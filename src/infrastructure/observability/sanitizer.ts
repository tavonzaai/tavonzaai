/**
 * @tavonza/observability — Data Sanitization & Redaction (Generic & Extensible)
 */

const DEFAULT_SENSITIVE_PATTERNS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'jwt',
  'apikey',
  'accesskey',
  'privatekey',
  'cardnumber',
  'cvv',
  'cvc',
  'authorization',
  'cookie',
]);

/**
 * Recursively redacts sensitive fields like passwords, secrets, tokens, and payment card numbers.
 * Supports arbitrary custom keys passed by the consumer.
 */
export function sanitizeData(data: unknown, customKeys?: string[]): unknown {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, customKeys));
  }

  const sensitiveSet = customKeys && customKeys.length > 0
    ? new Set([
        ...DEFAULT_SENSITIVE_PATTERNS,
        ...customKeys.map((k) => k.toLowerCase().replace(/[-_]/g, '')),
      ])
    : DEFAULT_SENSITIVE_PATTERNS;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (sensitiveSet.has(normalizedKey)) {
      result[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeData(value, customKeys);
    } else {
      result[key] = value;
    }
  }
  return result;
}
