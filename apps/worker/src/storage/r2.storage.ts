import { ATTACHMENT_CONFIG, type AllowedAttachmentMimeType } from '@kcc/shared';
import { badRequest } from '../lib/errors.js';

export interface StorageAdapter {
  putObject(key: string, body: ArrayBuffer, contentType: string): Promise<void>;
  getObject(
    key: string,
  ): Promise<{ body: ReadableStream | ArrayBuffer; contentType: string } | null>;
  deleteObject(key: string): Promise<void>;
}

const MIME_TO_EXT: Record<AllowedAttachmentMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function validateAttachmentFile(
  bytes: Uint8Array,
  declaredMimeType: string,
): { contentType: AllowedAttachmentMimeType; extension: string } {
  if (bytes.byteLength === 0) {
    throw badRequest('EMPTY_FILE', 'Uploaded file cannot be empty');
  }
  if (bytes.byteLength > ATTACHMENT_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw badRequest(
      'FILE_TOO_LARGE',
      `File exceeds maximum size of ${ATTACHMENT_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MiB`,
    );
  }

  if (
    !ATTACHMENT_CONFIG.ALLOWED_MIME_TYPES.includes(declaredMimeType as AllowedAttachmentMimeType)
  ) {
    throw badRequest('UNSUPPORTED_MEDIA_TYPE', 'Only JPEG, PNG, and WebP images are permitted');
  }

  // Verify magic bytes match declared MIME type
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (
    (declaredMimeType === 'image/jpeg' && !isJpeg) ||
    (declaredMimeType === 'image/png' && !isPng) ||
    (declaredMimeType === 'image/webp' && !isWebp)
  ) {
    throw badRequest(
      'INVALID_FILE_SIGNATURE',
      'File content does not match the declared image format',
    );
  }

  const contentType = declaredMimeType as AllowedAttachmentMimeType;
  return { contentType, extension: MIME_TO_EXT[contentType] };
}

export function buildAttachmentObjectKey(reportId: string, extension: string): string {
  return `reports/${reportId}/${crypto.randomUUID()}.${extension}`;
}

export class R2StorageAdapter implements StorageAdapter {
  constructor(private readonly bucket: R2Bucket) {}

  async putObject(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
    await this.bucket.put(key, body, {
      httpMetadata: { contentType },
    });
  }

  async getObject(
    key: string,
  ): Promise<{ body: ReadableStream | ArrayBuffer; contentType: string } | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    return {
      body: obj.body,
      contentType: obj.httpMetadata?.contentType || 'application/octet-stream',
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.bucket.delete(key);
  }
}
