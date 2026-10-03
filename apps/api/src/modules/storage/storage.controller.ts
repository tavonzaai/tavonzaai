import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { StorageService, generateKey } from '@tavonza/storage';

import {
  Base64UploadDto,
  BatchDeleteDto,
  BatchDeleteResponseDto,
  DeleteResultDto,
  FileExistsResponseDto,
  FileKeyQueryDto,
  FileMetadataResponseDto,
  FileUploadQueryDto,
  FileUploadResponseDto,
  ListFilesQueryDto,
  PresignedDownloadResponseDto,
  PresignedDownloadUrlDto,
  PresignedPostDto,
  PresignedPostResponseDto,
  PresignedUploadResponseDto,
  PresignedUploadUrlDto,
} from './dtos/storage.dto';

@ApiTags('System | Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /storage/upload
   * Multipart single-file upload
   */
  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file directly via multipart/form-data',
    description:
      'Uploads a file directly to the S3 bucket with auto-generated hierarchical key and returns URL and metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The binary file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: FileUploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: FileUploadQueryDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided in form field "file"');
    }

    const key = generateKey(query.category || 'temp', file.originalname, {
      folder: query.folder,
      addTimestamp: true,
      addRandomSuffix: true,
    });

    const result = await this.storageService.uploadFile({
      key,
      file: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
      isPublic: query.isPublic ?? true,
    });

    return {
      key: result.key,
      bucket: result.bucket,
      location: result.location,
      url: result.url,
      eTag: result.eTag,
      size: result.size,
      contentType: result.contentType,
    };
  }

  /**
   * POST /storage/upload/base64
   * Base64 data upload
   */
  @Post('upload/base64')
  @ApiOperation({
    summary: 'Upload a base64 encoded image or document',
    description: 'Decodes base64 string or data URI scheme and saves directly to S3',
  })
  @ApiOkResponse({ type: FileUploadResponseDto })
  async uploadBase64(@Body() dto: Base64UploadDto): Promise<FileUploadResponseDto> {
    const key = generateKey(dto.category || 'temp', dto.filename || 'upload.bin', {
      folder: dto.folder,
      addTimestamp: true,
      addRandomSuffix: true,
    });

    const result = await this.storageService.uploadBase64(dto.base64, {
      key,
      isPublic: dto.isPublic ?? true,
    });

    return {
      key: result.key,
      bucket: result.bucket,
      location: result.location,
      url: result.url,
      eTag: result.eTag,
      size: result.size,
      contentType: result.contentType,
    };
  }

  /**
   * POST /storage/presigned-upload-url
   * Generate Presigned PUT URL for direct client-to-S3 upload
   */
  @Post('presigned-upload-url')
  @ApiOperation({
    summary: 'Generate a presigned PUT URL for direct client-to-S3 upload',
    description:
      'Allows browsers, mobile apps, or frontend clients to upload large files directly to S3 without proxying data through the API server',
  })
  @ApiOkResponse({ type: PresignedUploadResponseDto })
  async getPresignedUploadUrl(
    @Body() dto: PresignedUploadUrlDto,
  ): Promise<PresignedUploadResponseDto> {
    const key = generateKey(dto.category || 'temp', dto.filename, {
      folder: dto.folder,
      addTimestamp: true,
      addRandomSuffix: true,
    });

    const result = await this.storageService.getPresignedUploadUrl({
      key,
      contentType: dto.contentType,
      contentLength: dto.contentLength,
      expiresIn: dto.expiresIn,
    });

    return {
      uploadUrl: result.uploadUrl,
      key: result.key,
      bucket: result.bucket,
      expiresIn: result.expiresIn,
      method: 'PUT',
      requiredHeaders: result.requiredHeaders,
      publicUrl: result.publicUrl,
    };
  }

  /**
   * POST /storage/presigned-post
   * Generate Presigned POST policy for direct browser HTML form upload
   */
  @Post('presigned-post')
  @ApiOperation({
    summary: 'Generate a presigned POST policy for direct browser form uploads',
    description:
      'Creates a signed HTML form policy with size limits and allowed content types for direct browser form submission',
  })
  @ApiOkResponse({ type: PresignedPostResponseDto })
  async getPresignedPost(@Body() dto: PresignedPostDto): Promise<PresignedPostResponseDto> {
    const key = generateKey(dto.category || 'temp', dto.filename, {
      folder: dto.folder,
      addTimestamp: true,
      addRandomSuffix: true,
    });

    const result = await this.storageService.getPresignedPost({
      key,
      expiresIn: dto.expiresIn,
      maxSizeBytes: dto.maxSizeBytes,
      allowedContentTypes: dto.allowedContentTypes,
    });

    return {
      url: result.url,
      fields: result.fields,
      key: result.key,
      bucket: result.bucket,
      expiresIn: result.expiresIn,
      publicUrl: result.publicUrl,
    };
  }

  /**
   * POST /storage/presigned-download-url
   * Generate secure presigned GET URL for private files
   */
  @Post('presigned-download-url')
  @ApiOperation({
    summary: 'Generate a presigned GET URL for temporary private file download',
    description:
      'Generates a time-limited secure link to view or download a private file from S3 without making the bucket public',
  })
  @ApiOkResponse({ type: PresignedDownloadResponseDto })
  async getPresignedDownloadUrl(
    @Body() dto: PresignedDownloadUrlDto,
  ): Promise<PresignedDownloadResponseDto> {
    const exists = await this.storageService.fileExists(dto.key);
    if (!exists) {
      throw new NotFoundException(`File with key "${dto.key}" was not found`);
    }

    const expiresIn = dto.expiresIn ?? 3600;
    const downloadUrl = await this.storageService.getPresignedDownloadUrl({
      key: dto.key,
      expiresIn,
      responseContentDisposition: dto.responseContentDisposition,
    });

    return {
      downloadUrl,
      key: dto.key,
      expiresIn,
    };
  }

  /**
   * GET /storage/file
   * Direct proxy download / stream of an S3 object
   */
  @Get('file')
  @ApiOperation({
    summary: 'Stream or download a file directly through the API',
    description: 'Fetches the object from S3 and streams it to the HTTP client',
  })
  async streamFile(@Query() query: FileKeyQueryDto, @Res() res: Response): Promise<void> {
    const exists = await this.storageService.fileExists(query.key);
    if (!exists) {
      throw new NotFoundException(`File with key "${query.key}" was not found`);
    }

    const file = await this.storageService.getFile(query.key);

    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }
    if (file.contentLength) {
      res.setHeader('Content-Length', file.contentLength);
    }
    if (file.eTag) {
      res.setHeader('ETag', file.eTag);
    }
    if (file.lastModified) {
      res.setHeader('Last-Modified', file.lastModified.toUTCString());
    }
    if (file.contentDisposition) {
      res.setHeader('Content-Disposition', file.contentDisposition);
    }

    file.stream.pipe(res);
  }

  /**
   * GET /storage/file/info
   * Fetch object metadata
   */
  @Get('file/info')
  @ApiOperation({ summary: 'Get metadata and size of an S3 object' })
  @ApiOkResponse({ type: FileMetadataResponseDto })
  async getFileInfo(@Query() query: FileKeyQueryDto): Promise<FileMetadataResponseDto> {
    try {
      const meta = await this.storageService.getFileMetadata(query.key);
      return {
        key: meta.key,
        bucket: meta.bucket,
        size: meta.size,
        contentType: meta.contentType,
        eTag: meta.eTag,
        lastModified: meta.lastModified,
        url: this.storageService.getPublicUrl(meta.key, meta.bucket),
        metadata: meta.metadata,
      };
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        throw new NotFoundException(`File with key "${query.key}" was not found`);
      }
      throw err;
    }
  }

  /**
   * GET /storage/file/exists
   * Check existence of an S3 object
   */
  @Get('file/exists')
  @ApiOperation({ summary: 'Check if an S3 object exists' })
  @ApiOkResponse({ type: FileExistsResponseDto })
  async checkFileExists(@Query() query: FileKeyQueryDto): Promise<FileExistsResponseDto> {
    const exists = await this.storageService.fileExists(query.key);
    return {
      key: query.key,
      exists,
    };
  }

  /**
   * GET /storage/files
   * List files by prefix
   */
  @Get('files')
  @ApiOperation({ summary: 'List files and folders matching a prefix' })
  async listFiles(@Query() query: ListFilesQueryDto) {
    const result = await this.storageService.listFiles({
      prefix: query.prefix,
      maxKeys: query.maxKeys,
      continuationToken: query.continuationToken,
    });

    return {
      files: result.files.map((f) => ({
        ...f,
        url: this.storageService.getPublicUrl(f.key, f.bucket),
      })),
      folders: result.folders,
      nextContinuationToken: result.nextContinuationToken,
      isTruncated: result.isTruncated,
      keyCount: result.keyCount,
    };
  }

  /**
   * DELETE /storage/file
   * Delete single object
   */
  @Delete('file')
  @ApiOperation({ summary: 'Delete an object from S3' })
  @ApiOkResponse({ type: DeleteResultDto })
  async deleteFile(@Query() query: FileKeyQueryDto): Promise<DeleteResultDto> {
    await this.storageService.deleteFile(query.key);
    return {
      deleted: true,
      key: query.key,
    };
  }

  /**
   * POST /storage/files/delete-batch
   * Delete batch of objects
   */
  @Post('files/delete-batch')
  @ApiOperation({ summary: 'Batch delete up to 1000 objects from S3' })
  @ApiOkResponse({ type: BatchDeleteResponseDto })
  async deleteFilesBatch(@Body() body: BatchDeleteDto): Promise<BatchDeleteResponseDto> {
    const result = await this.storageService.deleteFiles(body.keys);
    return {
      deleted: result.deleted,
      errors: result.errors,
    };
  }
}
