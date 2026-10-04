import type { Readable } from 'node:stream';

export interface StorageConfig {
  /**
   * Primary default S3 bucket name
   */
  bucket: string;

  /**
   * AWS Region (e.g. 'eu-west-2')
   */
  region?: string;

  /**
   * Optional explicit AWS credentials.
   * If omitted, AWS SDK v3 default credential chain (IAM roles, env vars) will be used.
   */
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };

  /**
   * Custom endpoint (e.g. for MinIO, LocalStack, or custom S3-compatible providers)
   */
  endpoint?: string;

  /**
   * Force path style URLs (s3.amazonaws.com/bucket instead of bucket.s3.amazonaws.com).
   * Commonly required by MinIO or LocalStack.
   */
  forcePathStyle?: boolean;

  /**
   * Optional CDN or CloudFront base URL (e.g. 'https://cdn.tavonza.com')
   * Used to format public URLs instead of direct S3 URLs.
   */
  cdnBaseUrl?: string;

  /**
   * Maximum retry attempts for S3 operations
   */
  maxRetries?: number;

  /**
   * Default expiration in seconds for signed download URLs (default: 86400 = 24 hours)
   */
  defaultSignedUrlExpiresIn?: number;
}

export type SupportedFileBody = Buffer | Uint8Array | Readable | string | Blob;

export interface UploadFileOptions {
  /**
   * File content as Buffer, Uint8Array, Readable stream, string, or Blob
   */
  file: SupportedFileBody;

  /**
   * S3 object key (path inside bucket)
   */
  key: string;

  /**
   * Optional bucket override (defaults to config.bucket)
   */
  bucket?: string;

  /**
   * MIME type of the file (e.g. 'image/png', 'application/pdf').
   * If omitted, will be auto-inferred from key extension or defaults to 'application/octet-stream'.
   */
  contentType?: string;

  /**
   * Content disposition header (e.g. 'inline', 'attachment; filename="doc.pdf"')
   */
  contentDisposition?: string;

  /**
   * Cache-Control header (e.g. 'public, max-age=31536000, immutable')
   */
  cacheControl?: string;

  /**
   * Custom S3 metadata key-value pairs (stored as x-amz-meta-*)
   */
  metadata?: Record<string, string>;

  /**
   * S3 Object tags formatted as query string or key-value object
   */
  tags?: Record<string, string>;

  /**
   * Expected content length in bytes (strongly recommended for streaming uploads)
   */
  contentLength?: number;

  /**
   * Content encoding (e.g. 'gzip', 'br')
   */
  contentEncoding?: string;

  /**
   * MD5 checksum in base64 format for data integrity validation
   */
  contentMD5?: string;

  /**
   * Whether to format the returned URL using the CDN / public domain
   */
  isPublic?: boolean;

  /**
   * Expiration time in seconds for the returned signed URL. Defaults to defaultSignedUrlExpiresIn (86400 = 24 hours).
   */
  signedUrlExpiresIn?: number;
}

export interface UploadMultipartOptions extends UploadFileOptions {
  /**
   * Part size in bytes for multipart chunking (minimum 5MB = 5 * 1024 * 1024)
   * Default: 5MB
   */
  partSize?: number;

  /**
   * Number of concurrent upload streams (queue size)
   * Default: 4
   */
  queueSize?: number;

  /**
   * Whether to leave aborted parts on upload error
   * Default: false
   */
  leavePartsOnError?: boolean;

  /**
   * Progress callback invoked as chunks are sent
   */
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  loaded?: number;
  total?: number;
  part?: number;
}

export interface UploadBase64Options {
  /**
   * S3 object key
   */
  key: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Explicit content type (auto-extracted from data URI if omitted)
   */
  contentType?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;

  /**
   * Cache-Control header
   */
  cacheControl?: string;

  /**
   * Whether to format returned URL using CDN / public URL
   */
  isPublic?: boolean;

  /**
   * Expiration time in seconds for the returned signed URL. Defaults to defaultSignedUrlExpiresIn (86400 = 24 hours).
   */
  signedUrlExpiresIn?: number;
}

export interface UploadFromUrlOptions {
  /**
   * Target S3 object key
   */
  key: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Optional content type override
   */
  contentType?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;

  /**
   * Cache-Control header
   */
  cacheControl?: string;

  /**
   * Timeout in milliseconds for downloading the source URL
   */
  timeoutMs?: number;

  /**
   * Whether to format returned URL using CDN / public URL
   */
  isPublic?: boolean;

  /**
   * Expiration time in seconds for the returned signed URL. Defaults to defaultSignedUrlExpiresIn (86400 = 24 hours).
   */
  signedUrlExpiresIn?: number;
}

export interface UploadResult {
  /**
   * Object key in S3
   */
  key: string;

  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * Standard S3 URI (s3://bucket/key)
   */
  location: string;

  /**
   * HTTPS URL to access the object (CDN or S3 virtual-hosted)
   */
  url: string;

  /**
   * Entity tag (MD5 hash of the object)
   */
  eTag?: string;

  /**
   * S3 Version ID if bucket versioning is enabled
   */
  versionId?: string;

  /**
   * Size in bytes if known
   */
  size?: number;

  /**
   * MIME content type
   */
  contentType?: string;
}

export interface PresignedUploadOptions {
  /**
   * Target S3 object key
   */
  key: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Expiration time in seconds (default: 900 seconds / 15 minutes, max: 604800 / 7 days)
   */
  expiresIn?: number;

  /**
   * Expected MIME type. If specified, the client MUST supply this exact Content-Type header on PUT.
   */
  contentType?: string;

  /**
   * Expected content length in bytes
   */
  contentLength?: number;

  /**
   * Custom metadata to be signed with the upload
   */
  metadata?: Record<string, string>;

  /**
   * Cache-Control header to be enforced
   */
  cacheControl?: string;
}

export interface PresignedUploadResult {
  /**
   * Presigned PUT URL for client-side direct upload
   */
  uploadUrl: string;

  /**
   * Object key
   */
  key: string;

  /**
   * Bucket name
   */
  bucket: string;

  /**
   * Expiration time in seconds
   */
  expiresIn: number;

  /**
   * HTTP method to use (PUT)
   */
  method: 'PUT';

  /**
   * Required request headers that client must pass with PUT
   */
  requiredHeaders?: Record<string, string>;

  /**
   * The final URL where the file will be accessible after upload
   */
  publicUrl: string;

  /**
   * Pre-authorized signed URL to retrieve the object immediately after upload
   */
  signedUrl?: string;
}

export interface PresignedPostOptions {
  /**
   * Target S3 object key
   */
  key: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Expiration time in seconds (default: 900 seconds / 15 minutes)
   */
  expiresIn?: number;

  /**
   * Minimum allowed file size in bytes (default: 1)
   */
  minSizeBytes?: number;

  /**
   * Maximum allowed file size in bytes (default: 50MB)
   */
  maxSizeBytes?: number;

  /**
   * Allowed Content-Type prefix or array (e.g. ['image/png', 'image/jpeg'] or 'image/')
   */
  allowedContentTypes?: string[];

  /**
   * Extra form fields to include in policy
   */
  fields?: Record<string, string>;
}

export interface PresignedPostResult {
  /**
   * S3 form action endpoint
   */
  url: string;

  /**
   * Form fields that must be sent in the multipart/form-data body
   */
  fields: Record<string, string>;

  /**
   * Target object key
   */
  key: string;

  /**
   * Target bucket
   */
  bucket: string;

  /**
   * Expiration time in seconds
   */
  expiresIn: number;

  /**
   * Final accessible URL
   */
  publicUrl: string;

  /**
   * Pre-authorized signed URL to retrieve the object immediately after upload
   */
  signedUrl?: string;
}

export interface PresignedDownloadOptions {
  /**
   * S3 object key
   */
  key: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Expiration time in seconds (default: 3600 seconds / 1 hour)
   */
  expiresIn?: number;

  /**
   * Overrides Response Content-Disposition (e.g. 'attachment; filename="invoice.pdf"')
   */
  responseContentDisposition?: string;

  /**
   * Overrides Response Content-Type (e.g. 'application/pdf')
   */
  responseContentType?: string;

  /**
   * Version ID if accessing a specific version in a versioned bucket
   */
  versionId?: string;
}

export interface GetFileResult {
  /**
   * Readable stream of file contents
   */
  stream: Readable;

  /**
   * Content length in bytes
   */
  contentLength?: number;

  /**
   * MIME content type
   */
  contentType?: string;

  /**
   * ETag hash
   */
  eTag?: string;

  /**
   * Last modified timestamp
   */
  lastModified?: Date;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;

  /**
   * Content disposition header
   */
  contentDisposition?: string;

  /**
   * Cache control header
   */
  cacheControl?: string;

  /**
   * Version ID
   */
  versionId?: string;
}

export interface ObjectMetadata {
  /**
   * S3 object key
   */
  key: string;

  /**
   * S3 bucket name
   */
  bucket: string;

  /**
   * Object size in bytes
   */
  size: number;

  /**
   * MIME content type
   */
  contentType?: string;

  /**
   * ETag hash
   */
  eTag?: string;

  /**
   * Last modified timestamp
   */
  lastModified?: Date;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;

  /**
   * Cache-Control header
   */
  cacheControl?: string;

  /**
   * Storage class (e.g. 'STANDARD', 'INTELLIGENT_TIERING')
   */
  storageClass?: string;
}

export interface ListFilesOptions {
  /**
   * Prefix filter (folder or path prefix, e.g. 'avatars/')
   */
  prefix?: string;

  /**
   * Optional bucket override
   */
  bucket?: string;

  /**
   * Maximum number of keys to return (default: 1000, max: 1000)
   */
  maxKeys?: number;

  /**
   * Continuation token for pagination
   */
  continuationToken?: string;

  /**
   * Delimiter character (commonly '/' for folder grouping)
   */
  delimiter?: string;
}

export interface ListFilesResult {
  /**
   * List of files matching the query
   */
  files: ObjectMetadata[];

  /**
   * Folder prefixes when delimiter is '/'
   */
  folders: string[];

  /**
   * Next pagination token
   */
  nextContinuationToken?: string;

  /**
   * Whether more results exist
   */
  isTruncated: boolean;

  /**
   * Number of keys returned in this page
   */
  keyCount: number;
}

export interface DeleteFilesResult {
  /**
   * Array of keys successfully deleted
   */
  deleted: string[];

  /**
   * Array of errors encountered during deletion
   */
  errors: Array<{
    key: string;
    code?: string;
    message?: string;
  }>;
}

export interface CopyFileOptions {
  /**
   * Source bucket (defaults to config.bucket)
   */
  sourceBucket?: string;

  /**
   * Destination bucket (defaults to sourceBucket or config.bucket)
   */
  destinationBucket?: string;

  /**
   * Metadata directive: 'COPY' (default) keeps existing metadata, 'REPLACE' overrides
   */
  metadataDirective?: 'COPY' | 'REPLACE';

  /**
   * New MIME type if replacing metadata
   */
  newContentType?: string;

  /**
   * New custom metadata if replacing
   */
  newMetadata?: Record<string, string>;

  /**
   * Cache-Control header if replacing
   */
  newCacheControl?: string;
}

export interface CopyResult {
  sourceKey: string;
  destinationKey: string;
  sourceBucket: string;
  destinationBucket: string;
  eTag?: string;
  url: string;
}

export type FileCategory =
  | 'avatars'
  | 'menus'
  | 'categories'
  | 'restaurants'
  | 'receipts'
  | 'invoices'
  | 'reports'
  | 'brands'
  | 'documents'
  | 'temp'
  | 'ai';

export interface GenerateKeyOptions {
  /**
   * Sub-folder or prefix (e.g. 'menus/burgers')
   */
  folder?: string;

  /**
   * Whether to preserve original filename (sanitized)
   * Default: true
   */
  preserveFilename?: boolean;

  /**
   * Whether to prefix with timestamp (YYYY-MM-DD or ms)
   * Default: true
   */
  addTimestamp?: boolean;

  /**
   * Whether to include a unique random ID / UUID
   * Default: true
   */
  addRandomSuffix?: boolean;

  /**
   * Explicit file extension (e.g. '.png' or 'png')
   */
  extension?: string;
}

export interface FileValidationRules {
  /**
   * Allowed MIME types (e.g. ['image/jpeg', 'image/png', 'image/webp'])
   */
  allowedMimeTypes?: string[];

  /**
   * Allowed file extensions (e.g. ['.jpg', '.png', '.webp'])
   */
  allowedExtensions?: string[];

  /**
   * Maximum file size in bytes
   */
  maxSizeBytes?: number;

  /**
   * Minimum file size in bytes (default: 1)
   */
  minSizeBytes?: number;
}
