import type { PublicUser, UserRole } from '@kcc/shared';
import { nowIso } from '../lib/db.js';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  role: UserRole;
  department_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface SessionJoinRow extends UserRow {
  session_id: string;
  csrf_token: string;
  expires_at: string;
  revoked_at: string | null;
}

function mapPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    departmentId: row.department_id,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserRepository {
  constructor(private readonly db: D1Database) {}

  async findByEmailWithPassword(
    email: string,
  ): Promise<{ user: PublicUser; passwordHash: string } | null> {
    const row = await this.db
      .prepare(
        `SELECT id, email, display_name, password_hash, role, department_id, is_active, created_at, updated_at
         FROM users WHERE lower(email) = lower(?) LIMIT 1`,
      )
      .bind(email)
      .first<UserRow>();

    if (!row) return null;
    return { user: mapPublicUser(row), passwordHash: row.password_hash };
  }

  async findPublicById(id: string): Promise<PublicUser | null> {
    const row = await this.db
      .prepare(
        `SELECT id, email, display_name, '' AS password_hash, role, department_id, is_active, created_at, updated_at
         FROM users WHERE id = ? LIMIT 1`,
      )
      .bind(id)
      .first<UserRow>();
    return row ? mapPublicUser(row) : null;
  }

  async createUser(params: {
    id: string;
    email: string;
    displayName: string;
    passwordHash: string;
    role: UserRole;
    departmentId?: string | null;
  }): Promise<PublicUser> {
    const now = nowIso();
    await this.db
      .prepare(
        `INSERT INTO users (id, email, display_name, password_hash, role, department_id, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      )
      .bind(
        params.id,
        params.email.toLowerCase(),
        params.displayName,
        params.passwordHash,
        params.role,
        params.departmentId ?? null,
        now,
        now,
      )
      .run();

    return {
      id: params.id,
      email: params.email.toLowerCase(),
      displayName: params.displayName,
      role: params.role,
      departmentId: params.departmentId ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async createSession(params: {
    id: string;
    userId: string;
    tokenHash: string;
    csrfToken: string;
    expiresAt: string;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO sessions (id, user_id, token_hash, csrf_token, expires_at, revoked_at, created_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      )
      .bind(
        params.id,
        params.userId,
        params.tokenHash,
        params.csrfToken,
        params.expiresAt,
        nowIso(),
      )
      .run();
  }

  async findActiveSessionByTokenHash(tokenHash: string): Promise<{
    sessionId: string;
    csrfToken: string;
    user: PublicUser;
  } | null> {
    const row = await this.db
      .prepare(
        `SELECT s.id AS session_id, s.csrf_token, s.expires_at, s.revoked_at,
                u.id, u.email, u.display_name, '' AS password_hash, u.role, u.department_id,
                u.is_active, u.created_at, u.updated_at
         FROM sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
         LIMIT 1`,
      )
      .bind(tokenHash, nowIso())
      .first<SessionJoinRow>();

    if (!row) return null;
    return {
      sessionId: row.session_id,
      csrfToken: row.csrf_token,
      user: mapPublicUser(row),
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.db
      .prepare(`UPDATE sessions SET revoked_at = ? WHERE id = ?`)
      .bind(nowIso(), sessionId)
      .run();
  }

  async listUsers(limit: number, offset: number): Promise<{ items: PublicUser[]; total: number }> {
    const countRow = await this.db
      .prepare(`SELECT COUNT(*) AS total FROM users`)
      .first<{ total: number }>();

    const { results } = await this.db
      .prepare(
        `SELECT id, email, display_name, '' AS password_hash, role, department_id, is_active, created_at, updated_at
         FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(limit, offset)
      .all<UserRow>();

    return {
      items: results.map(mapPublicUser),
      total: Number(countRow?.total ?? 0),
    };
  }

  async updateUserRole(
    userId: string,
    role: UserRole,
    departmentId: string | null,
  ): Promise<PublicUser | null> {
    await this.db
      .prepare(`UPDATE users SET role = ?, department_id = ?, updated_at = ? WHERE id = ?`)
      .bind(role, departmentId, nowIso(), userId)
      .run();
    return this.findPublicById(userId);
  }
}
