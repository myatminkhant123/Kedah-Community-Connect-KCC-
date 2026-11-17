# Database Migrations

All database schema changes for Kedah Community Connect (D1 / SQLite-compatible) live in this directory.

## Files

- `0001_initial_schema.sql`: Core tables (`departments`, `users`, `sessions`, `categories`, `reports`, `report_attachments`, `report_status_history`, `report_notes`, `audit_logs`, `notifications`) with foreign keys, `CHECK` constraints, and query indexes.
- `0002_seed_categories.sql`: Stable seed data for the 7 initial issue categories and 5 fictional Kedah demo departments.

## Running locally with Wrangler

From the repository root or `apps/worker`:

```bash
npm run db:migrate:local
```

Which executes:

```bash
npx wrangler d1 migrations apply kedah-community-connect-db --local
```

## Development-only demo accounts

Demo accounts (`RESIDENT`, `ADMIN`, `OFFICER`) are **never** seeded in production migrations. For local development only, run the local seed helper documented in `apps/worker/README.md` or `npm run db:seed:demo` after applying migrations.
