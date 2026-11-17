import { z } from 'zod';
import { REPORT_PRIORITIES, USER_ROLES } from '../constants/index.js';

export const reviewReportSchema = z
  .object({
    comment: z.string().trim().max(500).optional(),
  })
  .strict();

export const rejectReportSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(1000, 'Rejection reason must be at most 1,000 characters'),
  })
  .strict();

export const assignReportSchema = z
  .object({
    departmentId: z.string().trim().min(1, 'Department is required').max(64),
    assignedOfficerId: z.string().trim().min(1).max(64).optional().nullable(),
    priority: z.enum(REPORT_PRIORITIES).optional(),
    comment: z.string().trim().max(500).optional(),
  })
  .strict();

export const reopenReportSchema = z
  .object({
    reason: z.string().trim().min(10, 'Reopening reason must be at least 10 characters').max(1000),
  })
  .strict();

export const updateUserRoleSchema = z
  .object({
    role: z.enum(USER_ROLES),
    departmentId: z.string().trim().min(1).max(64).optional().nullable(),
  })
  .strict()
  .refine(
    (data) =>
      data.role !== 'OFFICER' || (data.departmentId != null && data.departmentId.length > 0),
    {
      message: 'Department is required when assigning the OFFICER role',
      path: ['departmentId'],
    },
  );

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).optional().nullable(),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(300).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const createDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(300).optional().nullable(),
  })
  .strict();

export const updateDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(300).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
export type RejectReportInput = z.infer<typeof rejectReportSchema>;
export type AssignReportInput = z.infer<typeof assignReportSchema>;
export type ReopenReportInput = z.infer<typeof reopenReportSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
