import type { ApiErrorBody } from '@kcc/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

let currentCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  currentCsrfToken = token;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && currentCsrfToken) {
    headers.set('X-CSRF-Token', currentCsrfToken);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let parsed: ApiErrorBody | null = null;
    try {
      parsed = (await res.json()) as ApiErrorBody;
    } catch {
      // Ignore JSON parse error
    }
    throw new ApiClientError(
      res.status,
      parsed?.error?.code || 'HTTP_ERROR',
      parsed?.error?.message || `Request failed with status ${res.status}`,
      parsed?.error?.requestId,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function getAttachmentDownloadUrl(reportId: string, attachmentId: string): string {
  return `${API_BASE}/reports/${reportId}/attachments/${attachmentId}`;
}
