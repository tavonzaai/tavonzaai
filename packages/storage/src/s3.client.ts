import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { StorageConfig } from './types.js';

/**
 * Creates and configures an AWS S3Client instance based on StorageConfig
 */
export function createS3Client(config: StorageConfig): S3Client {
  const s3Config: S3ClientConfig = {
    region: config.region || 'eu-west-2',
    maxAttempts: config.maxRetries ?? 3,
    followRegionRedirects: true,
  };

  // Explicit credentials if provided; otherwise AWS SDK uses default chain (IAM Role / ECS / Env)
  if (config.credentials && config.credentials.accessKeyId && config.credentials.secretAccessKey) {
    s3Config.credentials = {
      accessKeyId: config.credentials.accessKeyId,
      secretAccessKey: config.credentials.secretAccessKey,
      ...(config.credentials.sessionToken ? { sessionToken: config.credentials.sessionToken } : {}),
    };
  }

  // Custom endpoint (MinIO, LocalStack, Cloudflare R2, etc.)
  if (config.endpoint) {
    s3Config.endpoint = config.endpoint;
  }

  // Path style (e.g. required for MinIO: http://localhost:9000/my-bucket/key)
  if (config.forcePathStyle !== undefined) {
    s3Config.forcePathStyle = config.forcePathStyle;
  }

  return new S3Client(s3Config);
}
