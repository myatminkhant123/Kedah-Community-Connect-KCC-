import type { NoteVisibility, ReportPriority, ReportStatus, UserRole } from '../constants/index.js';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  departmentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Report {
  id: string;
  referenceCode: string;
  reporterId: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  description: string;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ReportStatus;
  priority: ReportPriority;
  departmentId: string | null;
  departmentName?: string | null;
  assignedOfficerId: string | null;
  assignedOfficerName?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface ReportAttachment {
  id: string;
  reportId: string;
  uploadedBy: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ReportStatusHistoryItem {
  id: string;
  reportId: string;
  actorId: string;
  actorName?: string;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  comment: string | null;
  createdAt: string;
}

export interface ReportNote {
  id: string;
  reportId: string;
  authorId: string;
  authorName?: string;
  body: string;
  visibility: NoteVisibility;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  reportId: string | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AnalyticsSummary {
  totalReports: number;
  byStatus: Record<ReportStatus, number>;
  byCategory: Array<{ categoryId: string; categoryName: string; count: number }>;
  averageResolutionHours: number | null;
  recentDailyCounts: Array<{ date: string; count: number }>;
}
