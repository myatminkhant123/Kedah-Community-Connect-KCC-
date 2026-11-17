import { describe, expect, it } from 'vitest';
import type { PublicUser, Report } from '@kcc/shared';
import {
  canAddNote,
  canEditReportFields,
  canUploadAttachment,
  canViewInternalNotes,
  canViewReport,
} from '../src/services/policy.service.js';

const residentA: PublicUser = {
  id: 'usr_a',
  email: 'a@example.com',
  displayName: 'Resident A',
  role: 'RESIDENT',
  departmentId: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const residentB: PublicUser = { ...residentA, id: 'usr_b', email: 'b@example.com' };

const officerWorks: PublicUser = {
  ...residentA,
  id: 'usr_off1',
  email: 'off1@example.com',
  role: 'OFFICER',
  departmentId: 'dept_public_works',
};

const officerDrainage: PublicUser = {
  ...residentA,
  id: 'usr_off2',
  email: 'off2@example.com',
  role: 'OFFICER',
  departmentId: 'dept_drainage',
};

const admin: PublicUser = {
  ...residentA,
  id: 'usr_adm',
  email: 'admin@example.com',
  role: 'ADMIN',
};

const sampleReport: Report = {
  id: 'rep_1',
  referenceCode: 'KCC-2026-ABC123',
  reporterId: 'usr_a',
  categoryId: 'cat_roads',
  title: 'Damaged footpath near market',
  description: 'Broken concrete slabs causing tripping hazard near the main entrance.',
  locationLabel: 'Alor Setar',
  latitude: null,
  longitude: null,
  status: 'ASSIGNED',
  priority: 'NORMAL',
  departmentId: 'dept_public_works',
  assignedOfficerId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  resolvedAt: null,
};

describe('RBAC and ownership policies', () => {
  it('prevents horizontal privilege escalation between residents', () => {
    expect(canViewReport(residentA, sampleReport)).toBe(true);
    expect(canViewReport(residentB, sampleReport)).toBe(false);
  });

  it('restricts officer visibility to assigned department or account', () => {
    expect(canViewReport(officerWorks, sampleReport)).toBe(true);
    expect(canViewReport(officerDrainage, sampleReport)).toBe(false);
  });

  it('never allows residents to view or create internal notes', () => {
    expect(canViewInternalNotes(residentA)).toBe(false);
    expect(canViewInternalNotes(officerWorks)).toBe(true);
    expect(canViewInternalNotes(admin)).toBe(true);
    expect(canAddNote(residentA, sampleReport, 'INTERNAL')).toBe(false);
    expect(canAddNote(officerWorks, sampleReport, 'INTERNAL')).toBe(true);
  });

  it('allows resident field edits only while SUBMITTED', () => {
    expect(canEditReportFields(residentA, sampleReport)).toBe(false);
    expect(canEditReportFields(residentA, { ...sampleReport, status: 'SUBMITTED' })).toBe(true);
  });

  it('prevents attachment uploads on rejected or cancelled reports for residents', () => {
    expect(canUploadAttachment(residentA, { ...sampleReport, status: 'REJECTED' })).toBe(false);
    expect(canUploadAttachment(officerWorks, sampleReport)).toBe(true);
  });
});
