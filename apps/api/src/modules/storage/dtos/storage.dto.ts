import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum StorageFileCategory {
  AVATARS = 'avatars',
  MENUS = 'menus',
  CATEGORIES = 'categories',
  RESTAURANTS = 'restaurants',
  RECEIPTS = 'receipts',
  INVOICES = 'invoices',
  REPORTS = 'reports',
  BRANDS = 'brands',
  DOCUMENTS = 'documents',
  TEMP = 'temp',
  AI = 'ai',
}

export class FileUploadQueryDto {
  @ApiPropertyOptional({
    description: 'Category/type of file for structured directory organization',
    enum: StorageFileCategory,
    default: StorageFileCategory.TEMP,
  })
  @IsOptional()
  @IsEnum(StorageFileCategory)
  category?: StorageFileCategory = StorageFileCategory.TEMP;

  @ApiPropertyOptional({
    description: 'Subfolder path inside the category (e.g. branch-123 or menu-items)',
    example: 'menu-items',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Whether to format the returned URL as a public CDN URL',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  isPublic?: boolean = true;
}

export class Base64UploadDto {
  @ApiProperty({
    description: 'Base64 data URL or raw base64 string',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  @IsNotEmpty()
  @IsString()
  base64!: string;

  @ApiPropertyOptional({
    description: 'Original or preferred filename with extension',
    example: 'avatar.png',
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({
    description: 'Category of file',
    enum: StorageFileCategory,
    default: StorageFileCategory.TEMP,
  })
  @IsOptional()
  @IsEnum(StorageFileCategory)
  category?: StorageFileCategory = StorageFileCategory.TEMP;

  @ApiPropertyOptional({
    description: 'Subfolder',
    example: 'users/123',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Whether to format as public URL',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}

export class PresignedUploadUrlDto {
  @ApiProperty({
    description: 'Original filename to upload (e.g. burger.png)',
    example: 'cheeseburger.png',
  })
  @IsNotEmpty()
  @IsString()
  filename!: string;

  @ApiPropertyOptional({
    description: 'Category of file',
    enum: StorageFileCategory,
    default: StorageFileCategory.TEMP,
  })
  @IsOptional()
  @IsEnum(StorageFileCategory)
  category?: StorageFileCategory = StorageFileCategory.TEMP;

  @ApiPropertyOptional({
    description: 'Subfolder inside the category',
    example: 'branch-1/dishes',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Expected MIME content type (e.g. image/png)',
    example: 'image/png',
  })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({
    description: 'Expected content length in bytes',
    example: 1048576,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  contentLength?: number;

  @ApiPropertyOptional({
    description: 'URL expiration in seconds (default: 900 / 15m)',
    default: 900,
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(86400)
  expiresIn?: number = 900;
}

export class PresignedPostDto {
  @ApiProperty({
    description: 'Original filename to upload',
    example: 'receipt.pdf',
  })
  @IsNotEmpty()
  @IsString()
  filename!: string;

  @ApiPropertyOptional({
    description: 'Category of file',
    enum: StorageFileCategory,
    default: StorageFileCategory.TEMP,
  })
  @IsOptional()
  @IsEnum(StorageFileCategory)
  category?: StorageFileCategory = StorageFileCategory.TEMP;

  @ApiPropertyOptional({
    description: 'Subfolder inside category',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Maximum allowed file size in bytes (default: 25MB)',
    default: 26214400,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSizeBytes?: number = 26214400;

  @ApiPropertyOptional({
    description: 'Allowed content types',
    example: ['image/png', 'image/jpeg', 'application/pdf'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedContentTypes?: string[];

  @ApiPropertyOptional({
    description: 'Expiration in seconds (default: 900)',
    default: 900,
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(86400)
  expiresIn?: number = 900;
}

export class PresignedDownloadUrlDto {
  @ApiProperty({
    description: 'S3 object key',
    example: 'menus/2026/10/03/43c0068e-burger.png',
  })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @ApiPropertyOptional({
    description: 'Expiration in seconds (default: 3600 / 1 hour)',
    default: 3600,
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(604800)
  expiresIn?: number = 3600;

  @ApiPropertyOptional({
    description: 'Override Content-Disposition (e.g. attachment; filename="burger.png")',
  })
  @IsOptional()
  @IsString()
  responseContentDisposition?: string;
}

export class FileKeyQueryDto {
  @ApiProperty({
    description: 'S3 object key',
    example: 'menus/2026/10/03/43c0068e-burger.png',
  })
  @IsNotEmpty()
  @IsString()
  key!: string;
}

export class ListFilesQueryDto {
  @ApiPropertyOptional({
    description: 'Directory prefix filter (e.g. menus/)',
    example: 'menus/',
  })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({
    description: 'Maximum items to return (default: 100, max: 1000)',
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  maxKeys?: number = 100;

  @ApiPropertyOptional({
    description: 'Continuation token for pagination',
  })
  @IsOptional()
  @IsString()
  continuationToken?: string;
}

export class BatchDeleteDto {
  @ApiProperty({
    description: 'Array of S3 object keys to delete',
    example: ['temp/file1.txt', 'temp/file2.txt'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  keys!: string[];
}

export class FileUploadResponseDto {
  @ApiProperty({ description: 'S3 Object Key' })
  key!: string;

  @ApiProperty({ description: 'S3 Bucket Name' })
  bucket!: string;

  @ApiProperty({ description: 'Standard S3 URI' })
  location!: string;

  @ApiProperty({ description: 'Direct HTTPS URL' })
  url!: string;

  @ApiPropertyOptional({ description: 'ETag checksum' })
  eTag?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  size?: number;

  @ApiPropertyOptional({ description: 'MIME content type' })
  contentType?: string;
}

export class PresignedUploadResponseDto {
  @ApiProperty({ description: 'Presigned PUT URL for client direct upload' })
  uploadUrl!: string;

  @ApiProperty({ description: 'Object Key' })
  key!: string;

  @ApiProperty({ description: 'Bucket Name' })
  bucket!: string;

  @ApiProperty({ description: 'Expiration in seconds' })
  expiresIn!: number;

  @ApiProperty({ description: 'HTTP Method (PUT)', default: 'PUT' })
  method!: 'PUT';

  @ApiPropertyOptional({ description: 'Required headers for PUT' })
  requiredHeaders?: Record<string, string>;

  @ApiProperty({ description: 'Final public URL of the asset' })
  publicUrl!: string;
}

export class PresignedPostResponseDto {
  @ApiProperty({ description: 'S3 form action URL' })
  url!: string;

  @ApiProperty({ description: 'Form fields required in multipart form data' })
  fields!: Record<string, string>;

  @ApiProperty({ description: 'Object Key' })
  key!: string;

  @ApiProperty({ description: 'Bucket Name' })
  bucket!: string;

  @ApiProperty({ description: 'Expiration in seconds' })
  expiresIn!: number;

  @ApiProperty({ description: 'Final public URL of the asset' })
  publicUrl!: string;
}

export class PresignedDownloadResponseDto {
  @ApiProperty({ description: 'Presigned GET URL for secure downloading' })
  downloadUrl!: string;

  @ApiProperty({ description: 'Object Key' })
  key!: string;

  @ApiProperty({ description: 'Expiration in seconds' })
  expiresIn!: number;
}

export class FileMetadataResponseDto {
  @ApiProperty({ description: 'S3 object key' })
  key!: string;

  @ApiProperty({ description: 'Bucket name' })
  bucket!: string;

  @ApiProperty({ description: 'Size in bytes' })
  size!: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  contentType?: string;

  @ApiPropertyOptional({ description: 'ETag' })
  eTag?: string;

  @ApiPropertyOptional({ description: 'Last modified timestamp' })
  lastModified?: Date;

  @ApiProperty({ description: 'Public URL' })
  url!: string;

  @ApiPropertyOptional({ description: 'Custom metadata' })
  metadata?: Record<string, string>;
}

export class FileExistsResponseDto {
  @ApiProperty({ description: 'Object Key' })
  key!: string;

  @ApiProperty({ description: 'Whether file exists in bucket' })
  exists!: boolean;
}

export class DeleteResultDto {
  @ApiProperty({ description: 'Whether file was deleted' })
  deleted!: boolean;

  @ApiProperty({ description: 'Object key' })
  key!: string;
}

export class BatchDeleteResponseDto {
  @ApiProperty({ description: 'Array of deleted object keys' })
  deleted!: string[];

  @ApiProperty({ description: 'Array of errors if any failed' })
  errors!: Array<{ key: string; code?: string; message?: string }>;
}
