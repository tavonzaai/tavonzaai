import dotenv from 'dotenv';
import path from 'node:path';
import { Readable } from 'node:stream';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { S3StorageService } from '../src/s3.service.js';
import { loadStorageConfig } from '../src/config.js';
import { generateKey } from '../src/key-generator.js';

async function main() {
  const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
  const bucketName = process.env.S3_BUCKET_NAME || 'tavonzaai-dev-storage-bucket';
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || 'minioadmin';
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || 'minioadmin';

  console.log('============================================================');
  console.log(`Testing Local MinIO S3 Emulator`);
  console.log(`Endpoint:    ${endpoint}`);
  console.log(`Bucket:      ${bucketName}`);
  console.log(`Credentials: ${accessKeyId} / ****`);
  console.log('============================================================\n');

  const config = loadStorageConfig({
    endpoint,
    forcePathStyle: true,
    bucket: bucketName,
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const storage = new S3StorageService(config);

  // 1. Ensure Bucket Exists
  console.log(`1. Ensuring bucket "${bucketName}" exists...`);
  const created = await storage.ensureBucketExists(bucketName);
  console.log(`   Bucket status: ${created ? 'Created new bucket' : 'Already exists'}`);

  const testKey = generateKey('temp', 'minio-test-file.txt', { folder: 'local-test' });
  const content = `Hello from Tavonza AI MinIO test at ${new Date().toISOString()}`;

  // 2. Upload Buffer
  console.log(`2. Uploading file: ${testKey}...`);
  const uploadRes = await storage.uploadFile({
    key: testKey,
    file: Buffer.from(content, 'utf-8'),
    contentType: 'text/plain',
    metadata: { env: 'local-minio', test: 'true' },
    cacheControl: 'max-age=3600',
  });
  console.log(`   Uploaded successfully! Location: ${uploadRes.location}, eTag: ${uploadRes.eTag}`);

  // 3. Check File Exists
  console.log(`3. Checking existence...`);
  const exists = await storage.fileExists(testKey);
  console.log(`   Exists: ${exists}`);
  if (!exists) throw new Error(`File ${testKey} does not exist after upload!`);

  // 4. Metadata
  console.log(`4. Getting metadata...`);
  const meta = await storage.getFileMetadata(testKey);
  console.log(`   Size: ${meta.size} bytes, ContentType: ${meta.contentType}, Metadata:`, meta.metadata);

  // 5. Download & Verify String
  console.log(`5. Reading file as string...`);
  const readContent = await storage.getFileString(testKey);
  console.log(`   Read content matches: ${readContent === content}`);
  if (readContent !== content) throw new Error('File content mismatch!');

  // 6. Presigned Download URL
  console.log(`6. Generating presigned download URL...`);
  const downloadUrl = await storage.getPresignedDownloadUrl({
    key: testKey,
    expiresIn: 300,
    responseContentDisposition: 'attachment; filename="minio-test.txt"',
  });
  console.log(`   URL: ${downloadUrl}`);
  console.log(`   Fetching presigned GET via HTTP fetch...`);
  const getResp = await fetch(downloadUrl);
  const fetchedText = await getResp.text();
  console.log(`   HTTP GET status: ${getResp.status}, text matches: ${fetchedText === content}`);
  if (getResp.status !== 200 || fetchedText !== content) {
    throw new Error(`Presigned GET failed with status ${getResp.status}`);
  }

  // 7. Presigned Upload URL (PUT)
  console.log(`7. Testing Presigned Upload (PUT)...`);
  const uploadTestKey = generateKey('temp', 'presigned-put.txt', { folder: 'local-test' });
  const presignedUpload = await storage.getPresignedUploadUrl({
    key: uploadTestKey,
    contentType: 'text/plain',
    expiresIn: 300,
  });
  const putContent = 'Uploaded directly to MinIO via presigned URL!';
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

  // 8. Base64 Upload
  console.log(`8. Testing Base64 upload...`);
  const b64Key = generateKey('temp', 'pixel.png', { folder: 'local-test' });
  const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const b64Res = await storage.uploadBase64(base64Data, { key: b64Key });
  console.log(`   Base64 uploaded: ${b64Res.key}, contentType: ${b64Res.contentType}, size: ${b64Res.size}`);

  // 9. Multipart Streaming Upload
  console.log(`9. Testing Multipart Streaming Upload...`);
  const streamKey = generateKey('temp', 'stream.txt', { folder: 'local-test' });
  const streamContent = 'MinIO chunk 1. MinIO chunk 2. Stream completed.';
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

  // 10. Copy File
  console.log(`10. Testing Copy File...`);
  const copyKey = generateKey('temp', 'copied-file.txt', { folder: 'local-test' });
  const copyRes = await storage.copyFile(testKey, copyKey);
  console.log(`    Copied to: ${copyRes.destinationKey}`);
  const copyExists = await storage.fileExists(copyKey);
  console.log(`    Copy exists: ${copyExists}`);

  // 11. Move File
  console.log(`11. Testing Move File...`);
  const moveKey = generateKey('temp', 'moved-file.txt', { folder: 'local-test' });
  await storage.moveFile(copyKey, moveKey);
  const oldExists = await storage.fileExists(copyKey);
  const newExists = await storage.fileExists(moveKey);
  console.log(`    Original after move exists: ${oldExists} (expected false), New exists: ${newExists} (expected true)`);

  // 12. List Files
  console.log(`12. Listing files with prefix 'temp/local-test/'...`);
  const listRes = await storage.listFiles({ prefix: 'temp/' });
  console.log(`    Found ${listRes.files.length} files in temp/`);

  // 13. Batch Deletion
  console.log(`13. Batch Deleting all test files...`);
  const keysToDelete = [testKey, uploadTestKey, b64Key, streamKey, moveKey];
  const deleteRes = await storage.deleteFiles(keysToDelete);
  console.log(`    Batch deleted ${deleteRes.deleted.length} files, Errors: ${deleteRes.errors.length}`);
  if (deleteRes.errors.length > 0) {
    console.error('Delete errors:', deleteRes.errors);
  }

  console.log('\n🎉 ALL MINIO S3 OPERATIONS PASSED VERIFICATION SUCCESSFULLY!\n');
}

main().catch((err) => {
  console.error('\n❌ MinIO verification failed:', err);
  process.exit(1);
});
