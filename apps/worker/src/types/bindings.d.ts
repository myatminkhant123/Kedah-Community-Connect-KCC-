import type { PublicUser } from '@kcc/shared';

export interface Env {
  DB: D1Database;
  REPORT_FILES?: R2Bucket;
  APP_ENV: string;
  CORS_ORIGIN?: string;
  SESSION_SECRET?: string;
}

export interface AuthContext {
  user: PublicUser;
  sessionId: string;
  csrfToken: string;
}

export interface AppVariables {
  requestId: string;
  auth?: AuthContext;
}
