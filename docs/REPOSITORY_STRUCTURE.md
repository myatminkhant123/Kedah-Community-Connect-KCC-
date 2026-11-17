# Repository Structure

Recommended monorepo structure:

```text
kedah-community-connect/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── router/
│   │   │   │   └── providers/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   └── layout/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── reports/
│   │   │   │   ├── admin/
│   │   │   │   ├── department/
│   │   │   │   └── notifications/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   └── config.ts
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── worker/
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── reports.routes.ts
│       │   │   ├── admin.routes.ts
│       │   │   ├── department.routes.ts
│       │   │   └── notifications.routes.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── require-role.middleware.ts
│       │   │   ├── request-id.middleware.ts
│       │   │   └── error.middleware.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── report.service.ts
│       │   │   ├── workflow.service.ts
│       │   │   ├── attachment.service.ts
│       │   │   └── notification.service.ts
│       │   ├── repositories/
│       │   │   ├── user.repository.ts
│       │   │   ├── report.repository.ts
│       │   │   └── department.repository.ts
│       │   ├── storage/
│       │   │   └── r2.storage.ts
│       │   ├── schemas/
│       │   │   ├── auth.schema.ts
│       │   │   └── report.schema.ts
│       │   ├── lib/
│       │   │   ├── db.ts
│       │   │   └── errors.ts
│       │   └── types/
│       │       └── bindings.d.ts
│       ├── test/
│       ├── package.json
│       └── wrangler.toml
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── constants/
│       │   ├── schemas/
│       │   └── types/
│       └── package.json
│
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_seed_categories.sql
│   └── README.md
│
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── README.md
│
├── docs/
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── REPOSITORY_STRUCTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── API_CONTRACT.md
│   ├── SECURITY.md
│   └── DECISIONS.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .editorconfig
├── .gitignore
├── .npmrc
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Structure rules

- Keep UI code inside `apps/web`.
- Keep Cloudflare Worker-specific code inside `apps/worker`.
- Put genuinely shared types and schemas in `packages/shared`.
- Keep database migrations at the repository root so they can be reviewed independently.
- Keep tests close to the code for unit tests and in `tests/e2e` for end-to-end flows.
- Do not create empty folders just to match this tree. Add them when their responsibility is implemented.
- Keep business rules in services, not directly in route handlers.
- Keep SQL in repositories or clearly named query modules.
- Do not put secrets in `.env` files that are committed. Commit only `.env.example` files containing placeholders.
