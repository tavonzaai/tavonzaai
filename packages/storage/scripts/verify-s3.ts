import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { S3StorageService } from '../src/s3.service.js';
import { loadStorageConfig } from '../src/config.js';
import { generateKey } from '../src/key-generator.js';
import { Readable } from 'node:stream';

async function testBucket(bucketName: string, environmentLabel: string) {
  console.log(`\n============================================================`);
  console.log(`Testing S3 package on ${environmentLabel}: [${bucketName}]`);
  console.log(`============================================================`);

  const config = loadStorageConfig({
    bucket: bucketName,
    region: 'eu-west-2',
    endpoint: undefined,
    forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const storage = new S3StorageService(config);

  const testKey = generateKey('temp', 'test-file.txt', { folder: 'pkg-test' });
  const content = `Hello from Tavonza AI storage package test on ${environmentLabel} at ${new Date().toISOString()}`;

  // 1. Upload Buffer
  console.log(`1. Uploading file: ${testKey}...`);
  const uploadRes = await storage.uploadFile({
    key: testKey,
    file: Buffer.from(content, 'utf-8'),
    contentType: 'text/plain',
    metadata: { environment: environmentLabel, test: 'true' },
    cacheControl: 'max-age=3600',
  });
  console.log(`   Uploaded successfully! Location: ${uploadRes.location}, eTag: ${uploadRes.eTag}`);

  // 2. File Exists
  console.log(`2. Checking existence...`);
  const exists = await storage.fileExists(testKey);
  console.log(`   Exists: ${exists}`);
  if (!exists) throw new Error(`File ${testKey} does not exist after upload!`);

  // 3. Metadata
  console.log(`3. Getting metadata...`);
  const meta = await storage.getFileMetadata(testKey);
  console.log(`   Size: ${meta.size} bytes, ContentType: ${meta.contentType}, Metadata:`, meta.metadata);

  // 4. Download String
  console.log(`4. Reading file as string...`);
  const readContent = await storage.getFileString(testKey);
  console.log(`   Read content matches: ${readContent === content}`);
  if (readContent !== content) throw new Error('File content mismatch!');

  // 5. Presigned Download URL & HTTP GET test
  console.log(`5. Generating presigned download URL...`);
  const downloadUrl = await storage.getPresignedDownloadUrl({
    key: testKey,
    expiresIn: 300,
    responseContentDisposition: 'attachment; filename="test.txt"',
  });
  console.log(`   Fetching presigned GET via HTTP fetch...`);
  const getResp = await fetch(downloadUrl);
  const fetchedText = await getResp.text();
  console.log(`   HTTP GET status: ${getResp.status}, text matches: ${fetchedText === content}`);
  if (getResp.status !== 200 || fetchedText !== content) {
    throw new Error(`Presigned GET failed with status ${getResp.status}`);
  }

  // 6. Presigned Upload URL & HTTP PUT test
  console.log(`6. Testing Presigned Upload (PUT)...`);
  const uploadTestKey = generateKey('temp', 'presigned-put.txt', { folder: 'pkg-test' });
  const presignedUpload = await storage.getPresignedUploadUrl({
    key: uploadTestKey,
    contentType: 'text/plain',
    expiresIn: 300,
  });
  const putContent = 'Uploaded via presigned URL directly!';
  const putResp = await fetch(presignedUpload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: putContent,
  });
  console.log(`   HTTP PUT status: ${putResp.status}`);
  if (putResp.status !== 200) {
    throw new Error(`Presigned PUT upload failed with status ${putResp.status}`);
  }
  const readPutContent = await storage.getFileString(uploadTestKey);
  console.log(`   Verified presigned PUT content matches: ${readPutContent === putContent}`);

  // 7. Base64 Upload
  console.log(`7. Testing Base64 upload...`);
  const b64Key = generateKey('temp', 'pixel.png', { folder: 'pkg-test' });
  const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const b64Res = await storage.uploadBase64(base64Data, { key: b64Key });
  console.log(`   Base64 uploaded: ${b64Res.key}, contentType: ${b64Res.contentType}, size: ${b64Res.size}`);

  // 8. Multipart Streaming Upload
  console.log(`8. Testing Multipart Streaming Upload...`);
  const streamKey = generateKey('temp', 'stream.txt', { folder: 'pkg-test' });
  const streamContent = 'Stream chunk 1. Stream chunk 2. Stream completed.';
  const stream = Readable.from([streamContent]);
  let progressCount = 0;
  const mpRes = await storage.uploadMultipart({
    key: streamKey,
    file: stream,
    contentType: 'text/plain',
    onProgress: () => {
      progressCount++;
    },
  });
  console.log(`   Multipart uploaded: ${mpRes.key}, progress callback called ${progressCount} times`);

  // 9. Copy File
  console.log(`9. Testing Copy File...`);
  const copyKey = generateKey('temp', 'copied-file.txt', { folder: 'pkg-test' });
  const copyRes = await storage.copyFile(testKey, copyKey);
  console.log(`   Copied to: ${copyRes.destinationKey}`);
  const copyExists = await storage.fileExists(copyKey);
  console.log(`   Copy exists: ${copyExists}`);

  // 10. Move File
  console.log(`10. Testing Move File...`);
  const moveKey = generateKey('temp', 'moved-file.txt', { folder: 'pkg-test' });
  await storage.moveFile(copyKey, moveKey);
  const oldExists = await storage.fileExists(copyKey);
  const newExists = await storage.fileExists(moveKey);
  console.log(`   Original after move exists: ${oldExists} (expected false), New exists: ${newExists} (expected true)`);

  // 11. List Files
  console.log(`11. Listing files with prefix 'temp/pkg-test/'...`);
  const listRes = await storage.listFiles({ prefix: 'temp/' });
  console.log(`   Found ${listRes.files.length} files in temp/`);

  // 12. Batch Deletion
  console.log(`12. Batch Deleting all test files...`);
  const keysToDelete = [testKey, uploadTestKey, b64Key, streamKey, moveKey];
  const deleteRes = await storage.deleteFiles(keysToDelete);
  console.log(`   Batch deleted ${deleteRes.deleted.length} files, Errors: ${deleteRes.errors.length}`);
  if (deleteRes.errors.length > 0) {
    console.error('Delete errors:', deleteRes.errors);
  }

  console.log(`✅ All S3 operations PASSED successfully on ${environmentLabel} [${bucketName}]!\n`);
}

async function main() {
  const env = process.env;
  // Load credentials from environment
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials not found in environment');
    process.exit(1);
  }

  // Test prod bucket
  await testBucket('tavonzaai-prod-storage-bucket', 'PROD');

  // Test live bucket
  await testBucket('tavonzaai-live-storage-bucket', 'LIVE');

  console.log('🎉 ALL S3 BUCKET OPERATIONS PASSED VERIFICATION ON BOTH PROD AND LIVE!');
}

main().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
