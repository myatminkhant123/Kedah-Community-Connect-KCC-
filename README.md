# Kedah Community Connect (KCC)

### Sistem Aduan Komuniti Negeri Kedah Darul Aman

A cloud-first community issue reporting and service-tracking platform connecting residents across Kedah with Local Authorities (PBT) and state agencies.

## Architecture at a Glance

- **Frontend (`apps/web`):** React 18 + TypeScript + Vite + Tailwind CSS (Cloudflare Pages)
- **API (`apps/worker`):** TypeScript + Hono on Cloudflare Workers
- **Shared Contracts (`packages/shared`):** Domain types, workflow constants, and Zod validation schemas
- **Database (`migrations/`):** Cloudflare D1 (SQLite-compatible relational database)
- **Object Storage:** Cloudflare R2 (private-by-default report attachments via Worker-authorised upload/download)
- **Testing:** Vitest, API integration tests, RBAC/security tests, and React component tests
- **CI/CD (`.github/workflows/`):** GitHub Actions (`ci.yml`, `deploy.yml`) + Wrangler

## Core Roles & Workflow

1. **Resident (`RESIDENT`):** Self-registers, submits reports with optional map coordinates and photos, tracks own reports, views public updates, and cancels own `SUBMITTED` reports.
2. **Administrator (`ADMIN`):** Reviews reports, rejects invalid submissions with a reason, assigns reports to departments/officers, manages categories, departments, and user roles, and views aggregate analytics.
3. **Department Officer (`OFFICER`):** Views reports assigned to their department or account, updates progress (`ASSIGNED → IN_PROGRESS → RESOLVED`), records internal/public notes, and uploads resolution evidence.

Workflow transitions:
`SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED` (plus `REJECTED`, `CANCELLED`, `REOPENED`).

Every transition is validated server-side by `WorkflowService` and recorded atomically in `report_status_history` and `audit_logs`.

## Local Development

### Prerequisites

- Node.js 18.18+ (LTS recommended)
- npm 9+
- Git

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Apply local D1 migrations
npm run db:migrate:local

# 3. (Optional) Seed local-only demo accounts
npm run db:seed:demo

# 4. Start Worker API (http://127.0.0.1:8787) and Web UI (http://localhost:5173)
npm run dev
```

### Quality Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Cost & Deployment Note

KCC targets a **$0 development and demonstration budget** using Cloudflare Workers, Pages, D1, and R2 free allowances. Free-plan quotas and terms can change; verify current Cloudflare pricing before deploying and never commit secrets to Git. See `docs/IMPLEMENTATION_GUIDE.md` and `docs/SECURITY.md` for details.
