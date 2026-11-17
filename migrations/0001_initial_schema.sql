-- Migration: 0001_initial_schema.sql
-- Kedah Community Connect (KCC) initial D1 (SQLite-compatible) schema

PRAGMA foreign_keys = ON;

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('RESIDENT', 'ADMIN', 'OFFICER')),
  department_id TEXT NULL REFERENCES departments(id) ON DELETE SET NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Sessions (server-side session tracking & revocation)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT NULL,
  created_at TEXT NOT NULL
);

-- 4. Issue categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 5. Reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_label TEXT NULL,
  latitude REAL NULL CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude REAL NULL CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  status TEXT NOT NULL CHECK (
    status IN (
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'CANCELLED',
      'REOPENED'
    )
  ),
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  department_id TEXT NULL REFERENCES departments(id),
  assigned_officer_id TEXT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  resolved_at TEXT NULL
);

-- 6. Report attachments (metadata only; binary objects stored in R2)
CREATE TABLE IF NOT EXISTS report_attachments (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  object_key TEXT UNIQUE NOT NULL,
  original_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  created_at TEXT NOT NULL
);

-- 7. Report status history (immutable workflow timeline)
CREATE TABLE IF NOT EXISTS report_status_history (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id),
  from_status TEXT NULL,
  to_status TEXT NOT NULL CHECK (
    to_status IN (
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
      'CANCELLED',
      'REOPENED'
    )
  ),
  comment TEXT NULL,
  created_at TEXT NOT NULL
);

-- 8. Report notes (PUBLIC vs INTERNAL visibility)
CREATE TABLE IF NOT EXISTS report_notes (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('INTERNAL', 'PUBLIC')),
  created_at TEXT NOT NULL
);

-- 9. Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata_json TEXT NULL,
  created_at TEXT NOT NULL
);

-- 10. In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id TEXT NULL REFERENCES reports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT NULL,
  created_at TEXT NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_created ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_category_created ON reports(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_department_status ON reports(department_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_officer ON reports(assigned_officer_id, status);
CREATE INDEX IF NOT EXISTS idx_report_attachments_report_id ON report_attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_status_history_report_created ON report_status_history(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_report_notes_report_created ON report_notes(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, read_at, created_at DESC);
