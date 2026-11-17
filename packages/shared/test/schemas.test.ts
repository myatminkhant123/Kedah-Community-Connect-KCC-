import { describe, expect, it } from 'vitest';
import {
  assignReportSchema,
  createReportSchema,
  registerSchema,
  updateUserRoleSchema,
} from '../src/index.js';

describe('shared schemas', () => {
  it('validates resident registration and rejects extra role fields', () => {
    const valid = registerSchema.safeParse({
      email: 'resident@example.com',
      displayName: 'Amina Ahmad',
      password: 'Password123!',
    });
    expect(valid.success).toBe(true);

    const escalationAttempt = registerSchema.safeParse({
      email: 'resident@example.com',
      displayName: 'Amina Ahmad',
      password: 'Password123!',
      role: 'ADMIN',
    });
    expect(escalationAttempt.success).toBe(false);
  });

  it('requires latitude and longitude together on report creation', () => {
    const missingLon = createReportSchema.safeParse({
      categoryId: 'cat_roads',
      title: 'Deep pothole near school gate',
      description: 'Large pothole causing motorcycles to swerve near the main gate.',
      latitude: 6.1248,
    });
    expect(missingLon.success).toBe(false);

    const valid = createReportSchema.safeParse({
      categoryId: 'cat_roads',
      title: 'Deep pothole near school gate',
      description: 'Large pothole causing motorcycles to swerve near the main gate.',
      locationLabel: 'Alor Setar',
      latitude: 6.1248,
      longitude: 100.3678,
    });
    expect(valid.success).toBe(true);
  });

  it('requires departmentId when assigning OFFICER role', () => {
    const invalid = updateUserRoleSchema.safeParse({ role: 'OFFICER' });
    expect(invalid.success).toBe(false);

    const valid = updateUserRoleSchema.safeParse({
      role: 'OFFICER',
      departmentId: 'dept_public_works',
    });
    expect(valid.success).toBe(true);
  });

  it('validates report assignment input', () => {
    const result = assignReportSchema.safeParse({
      departmentId: 'dept_drainage',
      priority: 'HIGH',
    });
    expect(result.success).toBe(true);
  });
});
