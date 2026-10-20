import { baseApiFetch } from '../api/baseApi';

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl?: string;
}

export interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export interface PresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresInSeconds?: number;
}

export interface StorageFileInfo {
  key: string;
  size?: number;
  contentType?: string;
  lastModified?: string;
  etag?: string;
}

export interface StorageFileListResponse {
  files: StorageFileInfo[];
  nextContinuationToken?: string;
}

export const storageService = {
  /**
   * POST /storage/upload
   * Multipart direct file upload to S3.
   */
  uploadFile: async (formData: FormData): Promise<{ url: string; key: string }> => {
    const res = await baseApiFetch<{ url: string; key: string }>('/storage/upload', {
      method: 'POST',
      body: formData,
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /storage/upload/base64
   * Direct Base64 image/document upload to S3.
   */
  uploadBase64: async (payload: {
    base64Data: string;
    mimeType: string;
    folder?: string;
    filename?: string;
  }): Promise<{ url: string; key: string }> => {
    const res = await baseApiFetch<{ url: string; key: string }>('/storage/upload/base64', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /storage/presigned-upload-url
   * Generates a presigned S3 PUT URL for direct browser-to-bucket uploads.
   */
  getPresignedUploadUrl: async (payload: {
    filename: string;
    contentType: string;
    folder?: string;
  }): Promise<PresignedUploadUrlResponse> => {
    const res = await baseApiFetch<PresignedUploadUrlResponse>('/storage/presigned-upload-url', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /storage/presigned-post
   * Generates presigned HTML Form POST policy fields for direct form upload.
   */
  getPresignedPost: async (payload: {
    filename: string;
    contentType: string;
    folder?: string;
  }): Promise<PresignedPostResponse> => {
    const res = await baseApiFetch<PresignedPostResponse>('/storage/presigned-post', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /storage/presigned-download-url
   * Generates a time-limited signed URL for secure private document downloads.
   */
  getPresignedDownloadUrl: async (payload: {
    key: string;
    expiresInSeconds?: number;
  }): Promise<PresignedDownloadUrlResponse> => {
    const res = await baseApiFetch<PresignedDownloadUrlResponse>('/storage/presigned-download-url', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /storage/file/info?key=
   * Inspects S3 object metadata and byte size.
   */
  getFileInfo: async (key: string): Promise<StorageFileInfo> => {
    const res = await baseApiFetch<StorageFileInfo>(`/storage/file/info?key=${encodeURIComponent(key)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /storage/file/exists?key=
   * Checks if an S3 key exists.
   */
  checkFileExists: async (key: string): Promise<{ exists: boolean; key: string }> => {
    const res = await baseApiFetch<{ exists: boolean; key: string }>(`/storage/file/exists?key=${encodeURIComponent(key)}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * GET /storage/files?prefix=&maxKeys=
   * Lists files in the storage bucket by folder prefix.
   */
  listFiles: async (params?: { prefix?: string; maxKeys?: number; continuationToken?: string }): Promise<StorageFileListResponse> => {
    const q = new URLSearchParams();
    if (params?.prefix) q.append('prefix', params.prefix);
    if (params?.maxKeys) q.append('maxKeys', String(params.maxKeys));
    if (params?.continuationToken) q.append('continuationToken', params.continuationToken);
    const qs = q.toString();
    const res = await baseApiFetch<StorageFileListResponse>(`/storage/files${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
    return (res as any)?.data || res;
  },

  /**
   * DELETE /storage/file?key=
   * Deletes a single file from S3 storage.
   */
  deleteFile: async (key: string): Promise<{ success: boolean; key: string }> => {
    const res = await baseApiFetch<{ success: boolean; key: string }>(`/storage/file?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    return (res as any)?.data || res;
  },

  /**
   * POST /storage/files/delete-batch
   * Deletes a batch of up to 1000 files from S3 storage in one request.
   */
  deleteBatchFiles: async (keys: string[]): Promise<{ deleted: string[]; errors?: any[] }> => {
    const res = await baseApiFetch<{ deleted: string[]; errors?: any[] }>('/storage/files/delete-batch', {
      method: 'POST',
      body: JSON.stringify({ keys }),
    });
    return (res as any)?.data || res;
  },
};
