import { describe, expect, it } from 'vitest';
import { buildAttachmentObjectKey, validateAttachmentFile } from '../src/storage/r2.storage.js';

describe('R2 storage validation', () => {
  it('accepts valid PNG magic bytes', () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = validateAttachmentFile(pngBytes, 'image/png');
    expect(result).toEqual({ contentType: 'image/png', extension: 'png' });
  });

  it('rejects mismatched magic bytes', () => {
    const fakeBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(() => validateAttachmentFile(fakeBytes, 'image/png')).toThrow();
  });

  it('generates server-controlled random object keys', () => {
    const key = buildAttachmentObjectKey('rep_123', 'jpg');
    expect(key).toMatch(/^reports\/rep_123\/[0-9a-f-]+\.jpg$/);
  });
});
