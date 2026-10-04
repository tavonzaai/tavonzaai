import { StorageConfig } from './types.js';

/**
 * Resolves storage configuration from environment variables with sensible defaults
 */
export function loadStorageConfig(overrides?: Partial<StorageConfig>): StorageConfig {
  const env = process.env;

  const bucket =
    overrides?.bucket ||
    env.S3_BUCKET_NAME ||
    env.AWS_S3_BUCKET ||
    env.S3_BUCKET ||
    env.S3_BUCKET_ASSETS ||
    '';

  const region =
    overrides?.region ||
    env.AWS_REGION ||
    env.S3_REGION ||
    'eu-west-2';

  const accessKeyId =
    overrides?.credentials?.accessKeyId ||
    env.S3_ACCESS_KEY_ID ||
    env.AWS_ACCESS_KEY_ID;

  const secretAccessKey =
    overrides?.credentials?.secretAccessKey ||
    env.S3_SECRET_ACCESS_KEY ||
    env.AWS_SECRET_ACCESS_KEY;

  const sessionToken =
    overrides?.credentials?.sessionToken ||
    env.S3_SESSION_TOKEN ||
    env.AWS_SESSION_TOKEN;

  const credentials =
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey, sessionToken }
      : undefined;

  const endpoint =
    overrides && 'endpoint' in overrides
      ? overrides.endpoint || undefined
      : env.S3_ENDPOINT || undefined;

  const forcePathStyle =
    overrides && 'forcePathStyle' in overrides
      ? overrides.forcePathStyle
      : env.S3_FORCE_PATH_STYLE === 'true' || env.S3_FORCE_PATH_STYLE === '1';

  const cdnBaseUrl = overrides?.cdnBaseUrl || env.CDN_BASE_URL || env.CLOUDFRONT_DOMAIN || undefined;

  const maxRetries = overrides?.maxRetries ?? (env.S3_MAX_RETRIES ? parseInt(env.S3_MAX_RETRIES, 10) : 3);

  return {
    bucket,
    region,
    credentials,
    endpoint,
    forcePathStyle,
    cdnBaseUrl,
    maxRetries,
  };
}
