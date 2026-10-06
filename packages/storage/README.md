# @tavonza/storage

Complete, enterprise-grade AWS S3 object storage package for the Tavonza AI platform.

Provides full-featured file upload methods, presigned URLs, streaming downloads, server-side object manipulation, automatic key generation, and seamless global NestJS dependency injection.

---

## Features

- **Direct Uploads**: Upload `Buffer`, `Uint8Array`, Node.js `Readable` streams, strings, or `Blob` objects.
- **Multipart Streaming Upload**: High-performance chunked uploads via `@aws-sdk/lib-storage` with concurrency control and real-time progress callbacks.
- **Base64 Uploads**: Handles Data URLs (`data:image/png;base64,...`) and raw Base64 data.
- **Remote URL Uploads**: Fetch and stream remote assets directly into S3.
- **Presigned PUT URLs**: Client-side direct S3 uploads with custom expiration and required headers.
- **Presigned POST Policies**: Direct browser HTML form uploads with strict size limits and MIME filtering.
- **Presigned GET URLs**: Secure, temporary private access to files with custom `Content-Disposition`.
- **Streaming & Content Retrieval**: Direct piping to Express/NestJS responses (`streamFile`), Buffer retrieval, and string extraction.
- **Object Lifecycle**: `fileExists`, `getFileMetadata`, `deleteFile`, `deleteFiles` (auto-chunked batch deletion up to 1000 items), `copyFile`, `moveFile`.
- **Directory Listing**: Prefix-based hierarchical folder navigation with S3 pagination (`continuationToken`).
- **Key Generation & Validation**: Collision-free date-partitioned keys (`category/YYYY/MM/DD/uuid-filename.ext`) and file size/MIME validation.
- **NestJS Integration**: Global `StorageModule` and injectable `StorageService`.

---

## Installation & Setup

`@tavonza/storage` is an internal monorepo package.

```json
{
  "dependencies": {
    "@tavonza/storage": "workspace:*"
  }
}
```

### Environment Variables

The package automatically loads from `process.env`. It works seamlessly with both local **MinIO** emulation and **AWS S3 Private Buckets** in production/live:

#### 1. Local Development (MinIO)

```env
# MinIO Local Endpoint & Path-Style
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true

# MinIO Default Credentials (overrides AWS_ACCESS_KEY_ID for storage only)
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin

# Bucket & Region
S3_BUCKET_NAME=tavonzaai-dev-storage-bucket
AWS_REGION=eu-west-2
```

#### 2. Production & Live (AWS S3 Private Bucket)

```env
# Leave endpoint and forcePathStyle unset/commented out for native AWS S3
# S3_ENDPOINT=
# S3_FORCE_PATH_STYLE=false

# Real IAM credentials (or omit to use AWS IAM Task / Instance Role)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Production Private Bucket
S3_BUCKET_NAME=tavonzaai-live-storage-bucket
AWS_REGION=eu-west-2

# Optional CDN Domain (CloudFront OAC fronting private bucket)
CDN_BASE_URL=https://cdn.tavonza.com
```

---

## Usage in NestJS

### 1. Register Module in `app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { StorageModule } from "@tavonza/storage";

@Module({
  imports: [
    StorageModule, // Automatically reads environment variables
  ],
})
export class AppModule {}
```

### 2. Inject `StorageService`

```typescript
import { Injectable } from "@nestjs/common";
import { StorageService, generateKey } from "@tavonza/storage";

@Injectable()
export class MenusService {
  constructor(private readonly storageService: StorageService) {}

  async uploadMenuItemPhoto(branchId: string, file: Express.Multer.File) {
    const key = generateKey("menus", file.originalname, {
      folder: `branches/${branchId}`,
      addTimestamp: true,
      addRandomSuffix: true,
    });

    const result = await this.storageService.uploadFile({
      key,
      file: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
      isPublic: true,
    });

    return {
      imageUrl: result.url,
      s3Key: result.key,
    };
  }
}
```

---

## Standalone / Programmatic Usage

You can use `S3StorageService` in workers, scripts, or non-NestJS services:

```typescript
import { S3StorageService, loadStorageConfig } from "@tavonza/storage";

const config = loadStorageConfig({
  bucket: "tavonzaai-live-storage-bucket",
  region: "eu-west-2",
});

const storage = new S3StorageService(config);

// 1. Upload Buffer
const upload = await storage.uploadFile({
  key: "reports/2026-summary.pdf",
  file: pdfBuffer,
  contentType: "application/pdf",
  cacheControl: "max-age=86400",
});

// 2. Generate Presigned Upload URL for Frontend
const presigned = await storage.getPresignedUploadUrl({
  key: "avatars/user-123.jpg",
  contentType: "image/jpeg",
  expiresIn: 900, // 15 mins
});

// 3. Generate Presigned Download URL for Private Invoice
const invoiceUrl = await storage.getPresignedDownloadUrl({
  key: "invoices/inv-001.pdf",
  expiresIn: 3600,
  responseContentDisposition: 'attachment; filename="invoice.pdf"',
});

// 4. Multipart Streaming for Large Files
await storage.uploadMultipart({
  key: "backups/db-dump.tar.gz",
  file: fileStream,
  onProgress: (p) => console.log(`Uploaded ${p.loaded} of ${p.total} bytes`),
});
```

---

## REST API Endpoints (`apps/api`)

Mounted under `/storage`:

| Method   | Endpoint                          | Description                                              |
| -------- | --------------------------------- | -------------------------------------------------------- |
| `POST`   | `/storage/upload`                 | Multipart file upload (`form-data`, field `file`)        |
| `POST`   | `/storage/upload/base64`          | Upload base64 encoded data URI or raw string             |
| `POST`   | `/storage/presigned-upload-url`   | Generate presigned PUT URL for client-side direct upload |
| `POST`   | `/storage/presigned-post`         | Generate presigned POST form policy with size limits     |
| `POST`   | `/storage/presigned-download-url` | Generate temporary presigned GET URL for private file    |
| `GET`    | `/storage/file`                   | Proxy/stream file directly from S3 to HTTP client        |
| `GET`    | `/storage/file/info`              | Fetch metadata, size, MIME type, and ETag                |
| `GET`    | `/storage/file/exists`            | Check if a file exists in the bucket                     |
| `GET`    | `/storage/files`                  | List files and folders by prefix with pagination         |
| `DELETE` | `/storage/file`                   | Delete a single file                                     |
| `POST`   | `/storage/files/delete-batch`     | Batch delete multiple files                              |

Interactive Swagger documentation is available at `https://api.tavonza.com/docs` under the **System \| Storage** tag.

---

## Verification Tests

### 1. Local MinIO Test

Verify connectivity and all upload/presign/delete operations against local MinIO:

```bash
# Start MinIO via Docker
pnpm docker:up

# Run MinIO test suite
pnpm storage:test:minio
```

### 2. AWS S3 Production & Live Test

Verify connectivity and all operations against real AWS S3 private buckets:

```bash
pnpm storage:test:s3
```
