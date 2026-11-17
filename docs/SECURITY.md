# Security Baseline & Verification Notes

## Implemented Controls

1. **Password Hashing:** Web Crypto `PBKDF2-SHA256` with 100,000 iterations, random 16-byte salt per user, and constant-time comparison (`apps/worker/src/lib/crypto.ts`). Password hashes are never returned by API endpoints.
2. **Session & CSRF Protection:** Server-side session table (`sessions`) stores SHA-256 hashes of 32-byte random tokens, expiry timestamps, and revocation timestamps. Browser cookies use `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production. All authenticated mutating requests (`POST`, `PATCH`, `PUT`, `DELETE`) require a matching `X-CSRF-Token` header.
3. **Server-Side RBAC & Ownership:** Public registration hardcodes `role = 'RESIDENT'` and rejects unexpected fields via Zod `.strict()`. Every report, note, and attachment endpoint enforces `policy.service.ts` checks on the server.
4. **Private Attachments:** Uploaded files are validated by size (<= 5 MiB), count (<= 5), MIME type, and file magic bytes (`JPEG`, `PNG`, `WEBP`). Storage keys are generated server-side (`reports/{reportId}/{uuid}.{ext}`), and downloads are served only through authorised API routes.
5. **SQL Injection Prevention:** All D1 queries use parameterized `.bind(...)` statements.
6. **Observability Without Data Leaks:** Request IDs (`X-Request-Id`) and structured logs omit passwords, session cookies, CSRF tokens, and report bodies.

## Remaining Risks & Pre-Production Checklist

- **Rate Limiting:** The current in-memory rate limiter is per-isolate. Before public production use, enable Cloudflare WAF Rate Limiting rules on `/api/v1/auth/*`.
- **Managed Identity Provider:** Evaluate Cloudflare Access or an OIDC provider before production if MFA or password reset emails are required.
- **Demo Accounts:** Never run `apps/worker/scripts/seed-demo.mjs` against a production D1 database.
