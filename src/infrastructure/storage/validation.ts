import path from 'node:path';
import { FileValidationRules } from './types.js';

export class StorageValidationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'FILE_VALIDATION_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'StorageValidationError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, StorageValidationError.prototype);
  }
}

/**
 * Common preset validation profiles
 */
export const PRESET_VALIDATION_RULES = {
  avatar: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    minSizeBytes: 1024, // 1KB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  } as FileValidationRules,

  menuItemImage: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    minSizeBytes: 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
  } as FileValidationRules,

  brandLogo: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
  } as FileValidationRules,

  document: {
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.csv', '.xls', '.xlsx'],
  } as FileValidationRules,

  generalImage: {
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
  } as FileValidationRules,
};

export interface FileToValidate {
  mimetype?: string;
  size?: number;
  originalname?: string;
  name?: string;
}

/**
 * Validates a file against configured validation rules
 * Throws StorageValidationError if validation fails
 */
export function validateFile(file: FileToValidate, rules?: FileValidationRules): void {
  if (!rules) return;

  const filename = file.originalname || file.name || '';
  const ext = filename ? path.extname(filename).toLowerCase() : '';
  const mimetype = (file.mimetype || '').toLowerCase();
  const size = file.size;

  // 1. Minimum size check
  if (rules.minSizeBytes !== undefined && size !== undefined && size < rules.minSizeBytes) {
    throw new StorageValidationError(
      `File size (${size} bytes) is below minimum allowed size (${rules.minSizeBytes} bytes)`,
      'FILE_TOO_SMALL',
      { size, minSizeBytes: rules.minSizeBytes },
    );
  }

  // 2. Maximum size check
  if (rules.maxSizeBytes !== undefined && size !== undefined && size > rules.maxSizeBytes) {
    const maxMb = (rules.maxSizeBytes / (1024 * 1024)).toFixed(1);
    const actualMb = (size / (1024 * 1024)).toFixed(1);
    throw new StorageValidationError(
      `File size (${actualMb} MB) exceeds maximum allowed size of ${maxMb} MB`,
      'FILE_TOO_LARGE',
      { size, maxSizeBytes: rules.maxSizeBytes },
    );
  }

  // 3. MIME type check
  if (rules.allowedMimeTypes && rules.allowedMimeTypes.length > 0 && mimetype) {
    const isAllowed = rules.allowedMimeTypes.some((allowed) => {
      if (allowed.endsWith('/*')) {
        const prefix = allowed.slice(0, -2);
        return mimetype.startsWith(prefix);
      }
      return mimetype === allowed.toLowerCase();
    });

    if (!isAllowed) {
      throw new StorageValidationError(
        `File MIME type '${mimetype}' is not allowed. Allowed types: ${rules.allowedMimeTypes.join(', ')}`,
        'INVALID_MIME_TYPE',
        { mimetype, allowedMimeTypes: rules.allowedMimeTypes },
      );
    }
  }

  // 4. Extension check
  if (rules.allowedExtensions && rules.allowedExtensions.length > 0 && ext) {
    const normalizedAllowed = rules.allowedExtensions.map((e) =>
      e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`,
    );

    if (!normalizedAllowed.includes(ext)) {
      throw new StorageValidationError(
        `File extension '${ext}' is not allowed. Allowed extensions: ${rules.allowedExtensions.join(', ')}`,
        'INVALID_FILE_EXTENSION',
        { extension: ext, allowedExtensions: rules.allowedExtensions },
      );
    }
  }
}
