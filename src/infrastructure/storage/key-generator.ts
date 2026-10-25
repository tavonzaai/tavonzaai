import { randomUUID } from 'node:crypto';
import path from 'node:path';
import mime from 'mime-types';
import { FileCategory, GenerateKeyOptions } from './types.js';

/**
 * Sanitizes a filename to ensure safe, S3-compatible, URL-friendly key segment
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed-file';

  // Extract base filename without directory traversal attempts
  const base = path.basename(filename);

  // Separate name and extension
  const ext = path.extname(base);
  const nameWithoutExt = base.slice(0, base.length - ext.length);

  // Clean the name: replace spaces and invalid characters with hyphens
  const cleanName = nameWithoutExt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80); // avoid overly long keys

  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');

  return `${cleanName || 'file'}${cleanExt}`;
}

/**
 * Returns the file extension (with dot, e.g. '.png') from a key or filename
 */
export function getFileExtension(filenameOrKey: string): string {
  if (!filenameOrKey) return '';
  return path.extname(filenameOrKey).toLowerCase();
}

/**
 * Auto-detects MIME content-type using extension or defaults to application/octet-stream
 */
export function getMimeType(filenameOrKey: string, fallback = 'application/octet-stream'): string {
  if (!filenameOrKey) return fallback;
  const detected = mime.lookup(filenameOrKey);
  return typeof detected === 'string' ? detected : fallback;
}

/**
 * Generates formatted date prefixes: YYYY/MM/DD
 */
export function getDatePrefix(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

/**
 * Generates a unique, hierarchical S3 object key
 *
 * Example output:
 * "menus/2026/10/03/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d-cheeseburger.png"
 */
export function generateKey(
  category: FileCategory | string,
  originalFilename?: string,
  options: GenerateKeyOptions = {},
): string {
  const {
    folder,
    preserveFilename = true,
    addTimestamp = true,
    addRandomSuffix = true,
    extension,
  } = options;

  const parts: string[] = [];

  // 1. Root category or custom folder
  const cleanCategory = category.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  if (cleanCategory) {
    parts.push(cleanCategory);
  }

  if (folder) {
    const cleanFolder = folder.trim().replace(/^\/+|\/+$/g, '');
    if (cleanFolder) {
      parts.push(cleanFolder);
    }
  }

  // 2. Date hierarchy (YYYY/MM/DD)
  if (addTimestamp) {
    parts.push(getDatePrefix());
  }

  // 3. File identifier
  const idParts: string[] = [];

  if (addRandomSuffix) {
    idParts.push(randomUUID());
  }

  let finalExt = extension ? (extension.startsWith('.') ? extension : `.${extension}`) : '';

  if (originalFilename) {
    const sanitized = sanitizeFilename(originalFilename);
    const existingExt = path.extname(sanitized);

    if (!finalExt && existingExt) {
      finalExt = existingExt;
    }

    if (preserveFilename) {
      const namePart = sanitized.slice(0, sanitized.length - existingExt.length);
      if (namePart) {
        idParts.push(namePart);
      }
    }
  }

  if (idParts.length === 0) {
    idParts.push(randomUUID());
  }

  const filenameSegment = `${idParts.join('-')}${finalExt || ''}`;
  parts.push(filenameSegment);

  return parts.join('/');
}

/**
 * Generates an S3 key scoped to an organization / restaurant tenant
 */
export function generateTenantKey(
  organizationId: string,
  category: FileCategory | string,
  originalFilename?: string,
  options: GenerateKeyOptions = {},
): string {
  const folder = options.folder
    ? `orgs/${organizationId}/${options.folder}`
    : `orgs/${organizationId}`;

  return generateKey(category, originalFilename, { ...options, folder });
}

/**
 * Generates an S3 key scoped to a specific restaurant branch
 */
export function generateBranchKey(
  branchId: string,
  category: FileCategory | string,
  originalFilename?: string,
  options: GenerateKeyOptions = {},
): string {
  const folder = options.folder
    ? `branches/${branchId}/${options.folder}`
    : `branches/${branchId}`;

  return generateKey(category, originalFilename, { ...options, folder });
}
