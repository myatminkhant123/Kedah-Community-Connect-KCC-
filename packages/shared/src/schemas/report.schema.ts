import { z } from 'zod';
import { NOTE_VISIBILITIES, REPORT_PRIORITIES, REPORT_STATUSES } from '../constants/index.js';

export const createReportSchema = z
  .object({
    categoryId: z.string().trim().min(1, 'Category is required').max(64),
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(120, 'Title must be at most 120 characters'),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters')
      .max(3000, 'Description must be at most 3,000 characters'),
    locationLabel: z
      .string()
      .trim()
      .max(160, 'Location description must be at most 160 characters')
      .optional()
      .nullable(),
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional()
      .nullable(),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional()
      .nullable(),
  })
  .strict()
  .refine(
    (data) =>
      (data.latitude == null && data.longitude == null) ||
      (data.latitude != null && data.longitude != null),
    {
      message: 'Both latitude and longitude must be provided together',
      path: ['latitude'],
    },
  );

export const updateReportSchema = z
  .object({
    categoryId: z.string().trim().min(1).max(64).optional(),
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(20).max(3000).optional(),
    locationLabel: z.string().trim().max(160).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

export const cancelReportSchema = z
  .object({
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const reportFilterQuerySchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  categoryId: z.string().trim().min(1).max(64).optional(),
  priority: z.enum(REPORT_PRIORITIES).optional(),
  search: z.string().trim().max(120).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createReportNoteSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(2, 'Note cannot be empty')
      .max(2000, 'Note must be at most 2,000 characters'),
    visibility: z.enum(NOTE_VISIBILITIES),
  })
  .strict();

export const officerStatusUpdateSchema = z
  .object({
    toStatus: z.enum(['IN_PROGRESS']),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();

export const resolveReportSchema = z
  .object({
    summary: z
      .string()
      .trim()
      .min(10, 'Resolution summary must be at least 10 characters')
      .max(2000, 'Resolution summary must be at most 2,000 characters'),
  })
  .strict();

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type CancelReportInput = z.infer<typeof cancelReportSchema>;
export type ReportFilterQuery = z.infer<typeof reportFilterQuerySchema>;
export type CreateReportNoteInput = z.infer<typeof createReportNoteSchema>;
export type OfficerStatusUpdateInput = z.infer<typeof officerStatusUpdateSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
