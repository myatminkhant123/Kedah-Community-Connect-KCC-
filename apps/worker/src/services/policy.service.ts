import type { NoteVisibility, PublicUser, Report } from '@kcc/shared';

export function canViewReport(user: PublicUser, report: Report): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'RESIDENT') {
    return report.reporterId === user.id;
  }
  if (user.role === 'OFFICER') {
    const sameDepartment = user.departmentId !== null && report.departmentId === user.departmentId;
    const directlyAssigned = report.assignedOfficerId === user.id;
    return sameDepartment || directlyAssigned;
  }
  return false;
}

export function canEditReportFields(user: PublicUser, report: Report): boolean {
  if (user.role === 'ADMIN') return true;
  return user.role === 'RESIDENT' && report.reporterId === user.id && report.status === 'SUBMITTED';
}

export function canViewInternalNotes(user: PublicUser): boolean {
  return user.role === 'ADMIN' || user.role === 'OFFICER';
}

export function canAddNote(user: PublicUser, report: Report, visibility: NoteVisibility): boolean {
  if (!canViewReport(user, report)) return false;
  if (visibility === 'INTERNAL') {
    return user.role === 'ADMIN' || user.role === 'OFFICER';
  }
  return true;
}

export function canUploadAttachment(user: PublicUser, report: Report): boolean {
  if (!canViewReport(user, report)) return false;
  if (user.role === 'RESIDENT') {
    return report.status !== 'REJECTED' && report.status !== 'CANCELLED';
  }
  return user.role === 'ADMIN' || user.role === 'OFFICER';
}
