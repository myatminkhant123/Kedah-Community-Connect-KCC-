export const USER_ROLES = ['RESIDENT', 'ADMIN', 'OFFICER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REPORT_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'CANCELLED',
  'REOPENED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

export const NOTE_VISIBILITIES = ['PUBLIC', 'INTERNAL'] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

export const ATTACHMENT_CONFIG = {
  MAX_FILES_PER_REPORT: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MiB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

export type AllowedAttachmentMimeType = (typeof ATTACHMENT_CONFIG.ALLOWED_MIME_TYPES)[number];
