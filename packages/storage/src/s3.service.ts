import { Readable } from 'node:stream';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  BucketLocationConstraint,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost, type PresignedPostOptions as S3PresignedPostOptions } from '@aws-sdk/s3-presigned-post';

import {
  StorageConfig,
  UploadFileOptions,
  UploadMultipartOptions,
  UploadBase64Options,
  UploadFromUrlOptions,
  UploadResult,
  PresignedUploadOptions,
  PresignedUploadResult,
  PresignedPostOptions,
  PresignedPostResult,
  PresignedDownloadOptions,
  GetFileResult,
  ObjectMetadata,
  ListFilesOptions,
  ListFilesResult,
  DeleteFilesResult,
  CopyFileOptions,
  CopyResult,
} from './types.js';
import { createS3Client } from './s3.client.js';
import { getMimeType } from './key-generator.js';

export class S3StorageService {
  private readonly client: S3Client;
  private readonly config: StorageConfig;

  constructor(config: StorageConfig, client?: S3Client) {
    this.config = config;
    this.client = client || createS3Client(config);
  }

  /**
   * Returns the underlying AWS S3Client
   */
  public getClient(): S3Client {
    return this.client;
  }

  /**
   * Returns the active storage configuration
   */
  public getConfig(): StorageConfig {
    return this.config;
  }

  /**
   * Returns the default bucket configured
   */
  public getDefaultBucket(): string {
    return this.config.bucket;
  }

  /**
   * Checks if an S3 bucket exists and is accessible
   */
  public async bucketExists(bucketOverride?: string): Promise<boolean> {
    const bucket = this.resolveBucket(bucketOverride);
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensures an S3 bucket exists, creating it if it does not.
   * Particularly useful for local development with MinIO or test suites.
   */
  public async ensureBucketExists(bucketOverride?: string): Promise<boolean> {
    const bucket = this.resolveBucket(bucketOverride);
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return false; // Already existed
    } catch (err: any) {
      const isNotFound =
        err.name === 'NotFound' ||
        err.name === 'NoSuchBucket' ||
        err.$metadata?.httpStatusCode === 404;

      if (isNotFound) {
        const createParams: { Bucket: string; CreateBucketConfiguration?: { LocationConstraint?: BucketLocationConstraint } } = {
          Bucket: bucket,
        };
        // AWS S3 requires LocationConstraint for regions other than us-east-1; MinIO accepts or ignores it
        if (this.config.region && this.config.region !== 'us-east-1') {
          createParams.CreateBucketConfiguration = {
            LocationConstraint: this.config.region as BucketLocationConstraint,
          };
        }
        await this.client.send(new CreateBucketCommand(createParams));
        return true; // Newly created
      }
      throw err;
    }
  }

  /**
   * Resolves target bucket with fallback to default bucket
   */
  private resolveBucket(bucketOverride?: string): string {
    const bucket = bucketOverride || this.config.bucket;
    if (!bucket) {
      throw new Error(
        'S3 bucket name is required. Set S3_BUCKET_NAME in environment or pass bucket in options.',
      );
    }
    return bucket;
  }

  /**
   * Formats a clean object key (strips leading slashes)
   */
  private sanitizeKey(key: string): string {
    if (!key) {
      throw new Error('S3 object key must be provided');
    }
    return key.replace(/^\/+/, '');
  }

  /**
   * Formats public HTTPS URL (via CDN or standard S3 virtual-hosted)
   */
  public getPublicUrl(key: string, bucketOverride?: string): string {
    const cleanKey = this.sanitizeKey(key);
    const bucket = this.resolveBucket(bucketOverride);

    if (this.config.cdnBaseUrl) {
      const base = this.config.cdnBaseUrl.replace(/\/+$/, '');
      return `${base}/${cleanKey}`;
    }

    if (this.config.endpoint) {
      const endpoint = this.config.endpoint.replace(/\/+$/, '');
      if (this.config.forcePathStyle) {
        return `${endpoint}/${bucket}/${cleanKey}`;
      }
      return `${endpoint.replace('://', `://${bucket}.`)}/${cleanKey}`;
    }

    const region = this.config.region || 'eu-west-2';
    return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
  }

  /**
   * Formats standard S3 URI (s3://bucket/key)
   */
  public getS3Uri(key: string, bucketOverride?: string): string {
    const cleanKey = this.sanitizeKey(key);
    const bucket = this.resolveBucket(bucketOverride);
    return `s3://${bucket}/${cleanKey}`;
  }

  /**
   * Standard File Upload (Buffer, Stream, Uint8Array, string, Blob)
   */
  public async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const bucket = this.resolveBucket(options.bucket);
    const key = this.sanitizeKey(options.key);
    const contentType = options.contentType || getMimeType(key);

    const tagsString = options.tags
      ? Object.entries(options.tags)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : undefined;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: options.file as any,
      ContentType: contentType,
      ContentDisposition: options.contentDisposition,
      CacheControl: options.cacheControl,
      Metadata: options.metadata,
      Tagging: tagsString,
      ContentLength: options.contentLength,
      ContentEncoding: options.contentEncoding,
      ContentMD5: options.contentMD5,
    });

    const response = await this.client.send(command);

    return {
      key,
      bucket,
      location: this.getS3Uri(key, bucket),
      url: this.getPublicUrl(key, bucket),
      eTag: response.ETag?.replace(/"/g, ''),
      versionId: response.VersionId,
      size: options.contentLength,
      contentType,
    };
  }

  /**
   * Multipart Upload with Concurrency & Progress Callback
   * Recommended for large files (> 5MB) or unknown stream sizes.
   */
  public async uploadMultipart(options: UploadMultipartOptions): Promise<UploadResult> {
    const bucket = this.resolveBucket(options.bucket);
    const key = this.sanitizeKey(options.key);
    const contentType = options.contentType || getMimeType(key);

    const tagsString = options.tags
      ? Object.entries(options.tags)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : undefined;

    const parallelUpload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: options.file as any,
        ContentType: contentType,
        ContentDisposition: options.contentDisposition,
        CacheControl: options.cacheControl,
        Metadata: options.metadata,
        Tagging: tagsString,
        ContentEncoding: options.contentEncoding,
      },
      partSize: options.partSize || 5 * 1024 * 1024, // 5MB chunks
      queueSize: options.queueSize || 4, // 4 concurrent parts
      leavePartsOnError: options.leavePartsOnError ?? false,
    });

    if (options.onProgress) {
      parallelUpload.on('httpUploadProgress', (progress: any) => {
        options.onProgress?.({
          loaded: progress.loaded,
          total: progress.total,
          part: progress.part,
        });
      });
    }

    const output = await parallelUpload.done();

    return {
      key,
      bucket,
      location: this.getS3Uri(key, bucket),
      url: this.getPublicUrl(key, bucket),
      eTag: output.ETag?.replace(/"/g, ''),
      versionId: output.VersionId,
      size: options.contentLength,
      contentType,
    };
  }

  /**
   * Upload Base64 Encoded Content (Supports Data URLs or raw Base64 strings)
   */
  public async uploadBase64(
    base64Data: string,
    options: UploadBase64Options,
  ): Promise<UploadResult> {
    let rawBase64 = base64Data;
    let detectedMime: string | undefined = options.contentType;

    // Check if Data URI scheme (data:image/png;base64,iVBOR...)
    const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.*)$/);
    if (dataUriMatch && dataUriMatch[1] && dataUriMatch[2]) {
      detectedMime = options.contentType || dataUriMatch[1];
      rawBase64 = dataUriMatch[2];
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    const contentType = detectedMime || getMimeType(options.key);

    return this.uploadFile({
      key: options.key,
      bucket: options.bucket,
      file: buffer,
      contentType,
      contentLength: buffer.length,
      metadata: options.metadata,
      cacheControl: options.cacheControl,
      isPublic: options.isPublic,
    });
  }

  /**
   * Upload from an External URL (Downloads buffer and streams into S3)
   */
  public async uploadFromUrl(
    sourceUrl: string,
    options: UploadFromUrlOptions,
  ): Promise<UploadResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);

    try {
      const response = await fetch(sourceUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(
          `Failed to download file from ${sourceUrl}: HTTP ${response.status} ${response.statusText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const headerMime = response.headers.get('content-type') || undefined;
      const contentType = options.contentType || headerMime || getMimeType(options.key);

      return this.uploadFile({
        key: options.key,
        bucket: options.bucket,
        file: buffer,
        contentType,
        contentLength: buffer.length,
        metadata: options.metadata,
        cacheControl: options.cacheControl,
        isPublic: options.isPublic,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generates a Presigned PUT URL for Client-Side Direct Upload
   */
  public async getPresignedUploadUrl(
    options: PresignedUploadOptions,
  ): Promise<PresignedUploadResult> {
    const bucket = this.resolveBucket(options.bucket);
    const key = this.sanitizeKey(options.key);
    const expiresIn = options.expiresIn ?? 900; // 15 mins default
    const contentType = options.contentType || getMimeType(key);

    const requiredHeaders: Record<string, string> = {};
    if (contentType) {
      requiredHeaders['Content-Type'] = contentType;
    }
    if (options.cacheControl) {
      requiredHeaders['Cache-Control'] = options.cacheControl;
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: options.contentLength,
      Metadata: options.metadata,
      CacheControl: options.cacheControl,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      key,
      bucket,
      expiresIn,
      method: 'PUT',
      requiredHeaders: Object.keys(requiredHeaders).length > 0 ? requiredHeaders : undefined,
      publicUrl: this.getPublicUrl(key, bucket),
    };
  }

  /**
   * Generates a Presigned POST Policy for Direct Browser Form Uploads
   */
  public async getPresignedPost(options: PresignedPostOptions): Promise<PresignedPostResult> {
    const bucket = this.resolveBucket(options.bucket);
    const key = this.sanitizeKey(options.key);
    const expiresIn = options.expiresIn ?? 900;

    const conditions: NonNullable<S3PresignedPostOptions['Conditions']> = [];

    // Size constraints
    const minSize = options.minSizeBytes ?? 1;
    const maxSize = options.maxSizeBytes ?? 50 * 1024 * 1024; // 50MB default
    conditions.push(['content-length-range', minSize, maxSize]);

    // Allowed content types
    if (options.allowedContentTypes && options.allowedContentTypes.length > 0) {
      for (const ct of options.allowedContentTypes) {
        if (ct.endsWith('/*')) {
          conditions.push(['starts-with', '$Content-Type', ct.slice(0, -2)]);
        } else {
          conditions.push(['eq', '$Content-Type', ct]);
        }
      }
    }

    const post = await createPresignedPost(this.client, {
      Bucket: bucket,
      Key: key,
      Conditions: conditions,
      Fields: options.fields || {},
      Expires: expiresIn,
    });

    return {
      url: post.url,
      fields: post.fields,
      key,
      bucket,
      expiresIn,
      publicUrl: this.getPublicUrl(key, bucket),
    };
  }

  /**
   * Generates a Presigned GET URL for Secure Download/Viewing
   */
  public async getPresignedDownloadUrl(options: PresignedDownloadOptions): Promise<string> {
    const bucket = this.resolveBucket(options.bucket);
    const key = this.sanitizeKey(options.key);
    const expiresIn = options.expiresIn ?? 3600; // 1 hour default

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: options.responseContentDisposition,
      ResponseContentType: options.responseContentType,
      VersionId: options.versionId,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Retrieves an object from S3 as a stream with metadata
   */
  public async getFile(key: string, bucketOverride?: string): Promise<GetFileResult> {
    const bucket = this.resolveBucket(bucketOverride);
    const cleanKey = this.sanitizeKey(key);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
    });

    const response = await this.client.send(command);

    return {
      stream: response.Body as Readable,
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      eTag: response.ETag?.replace(/"/g, ''),
      lastModified: response.LastModified,
      metadata: response.Metadata,
      contentDisposition: response.ContentDisposition,
      cacheControl: response.CacheControl,
      versionId: response.VersionId,
    };
  }

  /**
   * Retrieves an object from S3 as a Buffer
   */
  public async getFileBuffer(key: string, bucketOverride?: string): Promise<Buffer> {
    const file = await this.getFile(key, bucketOverride);
    const bytes = await (file.stream as any).transformToByteArray();
    return Buffer.from(bytes);
  }

  /**
   * Retrieves an object from S3 as a string
   */
  public async getFileString(
    key: string,
    bucketOverride?: string,
    encoding: BufferEncoding = 'utf-8',
  ): Promise<string> {
    const file = await this.getFile(key, bucketOverride);
    return (file.stream as any).transformToString(encoding);
  }

  /**
   * Retrieves an object as a Node.js Readable stream directly
   */
  public async getFileStream(key: string, bucketOverride?: string): Promise<Readable> {
    const file = await this.getFile(key, bucketOverride);
    return file.stream;
  }

  /**
   * Checks whether an object exists in S3 (returns boolean, no throw on 404)
   */
  public async fileExists(key: string, bucketOverride?: string): Promise<boolean> {
    try {
      await this.getFileMetadata(key, bucketOverride);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Retrieves object metadata (HeadObject)
   */
  public async getFileMetadata(key: string, bucketOverride?: string): Promise<ObjectMetadata> {
    const bucket = this.resolveBucket(bucketOverride);
    const cleanKey = this.sanitizeKey(key);

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
    });

    const response = await this.client.send(command);

    return {
      key: cleanKey,
      bucket,
      size: response.ContentLength ?? 0,
      contentType: response.ContentType,
      eTag: response.ETag?.replace(/"/g, ''),
      lastModified: response.LastModified,
      metadata: response.Metadata,
      cacheControl: response.CacheControl,
      storageClass: response.StorageClass,
    };
  }

  /**
   * Deletes a single file from S3
   */
  public async deleteFile(key: string, bucketOverride?: string): Promise<boolean> {
    const bucket = this.resolveBucket(bucketOverride);
    const cleanKey = this.sanitizeKey(key);

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
    });

    await this.client.send(command);
    return true;
  }

  /**
   * Deletes multiple files in batch (automatically chunks into batches of 1000)
   */
  public async deleteFiles(keys: string[], bucketOverride?: string): Promise<DeleteFilesResult> {
    if (!keys || keys.length === 0) {
      return { deleted: [], errors: [] };
    }

    const bucket = this.resolveBucket(bucketOverride);
    const result: DeleteFilesResult = { deleted: [], errors: [] };

    // S3 DeleteObjects max batch size is 1000
    const chunkSize = 1000;
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize).map((k) => ({ Key: this.sanitizeKey(k) }));

      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk,
          Quiet: false,
        },
      });

      const response = await this.client.send(command);

      if (response.Deleted) {
        for (const item of response.Deleted) {
          if (item.Key) result.deleted.push(item.Key);
        }
      }

      if (response.Errors) {
        for (const err of response.Errors) {
          result.errors.push({
            key: err.Key || '',
            code: err.Code,
            message: err.Message,
          });
        }
      }
    }

    return result;
  }

  /**
   * Server-side Copy an object in S3
   */
  public async copyFile(
    sourceKey: string,
    destinationKey: string,
    options: CopyFileOptions = {},
  ): Promise<CopyResult> {
    const sourceBucket = this.resolveBucket(options.sourceBucket);
    const destBucket = this.resolveBucket(options.destinationBucket || sourceBucket);
    const cleanSource = this.sanitizeKey(sourceKey);
    const cleanDest = this.sanitizeKey(destinationKey);

    const copySource = `${sourceBucket}/${cleanSource}`;

    const command = new CopyObjectCommand({
      Bucket: destBucket,
      Key: cleanDest,
      CopySource: encodeURI(copySource),
      MetadataDirective: options.metadataDirective || 'COPY',
      ContentType: options.newContentType,
      Metadata: options.newMetadata,
      CacheControl: options.newCacheControl,
    });

    const response = await this.client.send(command);

    return {
      sourceKey: cleanSource,
      destinationKey: cleanDest,
      sourceBucket,
      destinationBucket: destBucket,
      eTag: response.CopyObjectResult?.ETag?.replace(/"/g, ''),
      url: this.getPublicUrl(cleanDest, destBucket),
    };
  }

  /**
   * Move an object (Copy server-side + Delete source)
   */
  public async moveFile(
    sourceKey: string,
    destinationKey: string,
    options: CopyFileOptions = {},
  ): Promise<CopyResult> {
    const copyResult = await this.copyFile(sourceKey, destinationKey, options);
    await this.deleteFile(sourceKey, options.sourceBucket);
    return copyResult;
  }

  /**
   * Lists files and folders with prefix and pagination
   */
  public async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    const bucket = this.resolveBucket(options.bucket);
    const prefix = options.prefix ? this.sanitizeKey(options.prefix) : undefined;

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: options.maxKeys || 1000,
      ContinuationToken: options.continuationToken,
      Delimiter: options.delimiter,
    });

    const response = await this.client.send(command);

    const files: ObjectMetadata[] = (response.Contents || []).map((item) => ({
      key: item.Key || '',
      bucket,
      size: item.Size ?? 0,
      eTag: item.ETag?.replace(/"/g, ''),
      lastModified: item.LastModified,
      storageClass: item.StorageClass,
    }));

    const folders = (response.CommonPrefixes || []).map((cp) => cp.Prefix || '');

    return {
      files,
      folders,
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated ?? false,
      keyCount: response.KeyCount ?? files.length,
    };
  }
}
