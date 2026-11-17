import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().trim().email('Please provide a valid email address').max(255),
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(80, 'Display name must be at most 80 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please provide a valid email address').max(255),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
