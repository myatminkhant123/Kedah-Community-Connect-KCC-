# Step-by-Step Implementation Guide

This guide builds KCC incrementally. Complete and test each milestone before moving on.

## Stage 0 — Prepare the development environment

Install:
- Node.js LTS
- npm
- Git
- Visual Studio Code or another editor

Check:

```bash
node --version
npm --version
git --version
```

Create the repository:

```bash
mkdir kedah-community-connect
cd kedah-community-connect
git init
```

Create the initial README, `.gitignore`, and documentation folders. Make the first commit:

```bash
git add .
git commit -m "chore: initialise KCC repository"
```

Do not create a Cloudflare deployment yet.

## Stage 1 — Establish the monorepo

Use npm workspaces. Create root `package.json` with workspaces for `apps/*` and `packages/*`. Add shared scripts for linting, formatting, and tests as the packages are created.

Create:
- `apps/web`
- `apps/worker`
- `packages/shared`
- `migrations`
- `docs`

Set up React + TypeScript + Vite in `apps/web`. Set up a TypeScript Worker project using Hono in `apps/worker`. Confirm both can run locally.

Deliverable: a simple page can call a `/api/v1/health` endpoint and display the response.

## Stage 2 — Build the database schema

Create migration `0001_initial_schema.sql` for:
- users
- departments
- categories
- reports
- report_attachments
- report_status_history
- report_notes
- audit_logs
- notifications

Create a second migration to seed issue categories and demo departments. Use stable IDs for seed data.

Add indexes listed in the technical specification. Add constraints for roles, statuses, and note visibility where supported. Enable foreign-key enforcement.

Run migrations against the local D1 database using the current Wrangler command syntax. Verify tables and constraints with SQL queries.

Deliverable: migrations create a working local schema and seed reference data.

## Stage 3 — Implement shared types and validation

In `packages/shared`, define:
- `UserRole`
- `ReportStatus`
- `Priority`
- API error response type
- report create/update input schemas
- pagination query schema

Use Zod for runtime validation. Share schemas only where the frontend and Worker can safely use the same package. The Worker must always validate incoming requests independently.

Deliverable: type-safe shared contracts with validation tests.

## Stage 4 — Implement authentication

Build registration, login, logout, and current-user endpoints.

Requirements:
- Normal public registration creates only `RESIDENT` accounts.
- Passwords are hashed with a maintained library compatible with Workers.
- Use secure cookie-based sessions if feasible; add CSRF protection for state-changing requests.
- Store session data safely and define expiry and revocation.
- Add authentication middleware.
- Add rate limiting or abuse controls to login.
- Never return password hashes.
- Seed local demo admin/officer accounts through a development-only script or documented local process. Do not expose default credentials in production.

Tests:
- valid registration and login
- invalid credentials
- inactive account
- resident cannot assign themselves a privileged role
- unauthenticated request is rejected
- logout invalidates the session

Deliverable: working authentication and a tested current-user endpoint.

## Stage 5 — Implement role and ownership policies

Create a central permission policy module. Examples:
- Resident may read own report.
- Administrator may read all reports.
- Officer may read reports assigned to their department or account.
- Only administrator may assign reports or change user roles.
- Only authorised staff may create internal notes.
- Resident may never read internal notes.

Do not scatter role comparisons across many route files. Use middleware for broad role checks and service-level ownership checks for individual resources.

Deliverable: permission tests, including attempts to access another user's report.

## Stage 6 — Implement report creation and listing

Build:
- `POST /api/v1/reports`
- `GET /api/v1/reports`
- `GET /api/v1/reports/:reportId`
- `PATCH /api/v1/reports/:reportId`

Implement repository functions using parameterised SQL. Add pagination and filters. Residents see only their reports; staff see only authorised records.

Create frontend screens:
- report list
- report creation form
- report detail
- status timeline

Deliverable: resident can submit a report and track it.

## Stage 7 — Implement the workflow engine

Create a single workflow service containing allowed transitions. Every transition must:
1. Load the report.
2. Check actor permission.
3. Check that the transition is allowed.
4. Validate required fields.
5. Update report status and timestamps.
6. Insert status history.
7. Write an audit record for important administrative changes.

Use a transaction where supported. Do not let the frontend decide which transitions are legal.

Deliverable: tested end-to-end report lifecycle.

## Stage 8 — Implement administration and department work queues

Admin features:
- report search/filter
- review and rejection
- assignment to department/officer
- category and department management
- dashboard summary

Officer features:
- assigned report list
- progress update
- internal/public notes
- resolution summary and evidence

Deliverable: administrator can route a report and an authorised officer can resolve it.

## Stage 9 — Implement file storage

Start with local test files or mocked storage during unit tests. Then configure an R2 bucket when ready to deploy.

Implement:
- file count and size limits
- MIME and file-signature checks where feasible
- random object keys
- private-by-default access
- metadata persistence in D1
- authorised downloads

Never trust a filename or object key supplied by the browser. Never make private uploads publicly readable by default.

Deliverable: a resident can attach a permitted image and an authorised user can retrieve it.

## Stage 10 — Build the frontend experience

Recommended screens:
- Landing page and service explanation
- Register / sign in
- Resident dashboard
- New report form
- My reports
- Report detail and timeline
- Admin dashboard
- Admin report queue and detail
- Department work queue
- Profile and notifications
- Not-found and error states

UI requirements:
- responsive layouts
- accessible labels and keyboard support
- clear loading, empty, and error states
- form validation messages
- role-aware navigation
- no reliance on frontend-only security

Deliverable: all MVP user journeys work through the browser.

## Stage 11 — Add tests and quality checks

Add:
- unit tests for schemas and workflow transitions
- API tests for routes and permission boundaries
- component tests for important forms and views
- end-to-end test for resident → admin → officer → resolved
- tests that internal notes are not visible to residents
- tests for missing bindings and storage errors

Add formatting, linting, type-checking, and test scripts to the root package.

Deliverable: `npm run lint`, `npm run typecheck`, and `npm test` pass.

## Stage 12 — Configure CI

Create `.github/workflows/ci.yml` to run on pull requests and pushes:
1. install dependencies using the lockfile
2. run formatter check
3. run lint
4. run type-check
5. run unit and integration tests
6. build the frontend and Worker

CI must not require production secrets for normal pull-request checks.

Deliverable: GitHub Actions validates every change.

## Stage 13 — Deploy cautiously

Before deployment:
- confirm current Cloudflare free plan limits and regional/service availability
- create a development environment first
- create D1 database and R2 bucket only if needed
- configure bindings using current Wrangler documentation
- set secrets through the platform secret mechanism
- configure allowed origins and cookie settings
- deploy Worker and frontend
- run smoke tests
- inspect logs and usage
- document exact deployed services and plan limitations

Do not upgrade to a paid plan simply to complete the guide. If a required capability is not available within the free plan, keep it local or choose another genuinely free alternative.

Deliverable: a documented demo deployment within the account's allowed limits, or a reproducible local demo if deployment is unavailable.

## Stage 14 — Monitoring, operations, and final documentation

Add:
- structured request logs
- request IDs
- error tracking and basic latency review
- operational runbook
- deployment rollback notes
- data export and recovery notes
- security checklist
- architecture diagram
- API contract
- screenshots and demo walkthrough

Document known limitations and future improvements honestly.

## Suggested commit sequence

1. `chore: initialise monorepo`
2. `feat: add web and worker health check`
3. `feat: add initial database migrations`
4. `feat: add shared domain schemas`
5. `feat: implement authentication`
6. `feat: add role and ownership policies`
7. `feat: implement resident report workflow`
8. `feat: add admin assignment workflow`
9. `feat: add department work queue`
10. `feat: integrate private file storage`
11. `test: cover core user journeys`
12. `ci: add GitHub Actions checks`
13. `deploy: configure Cloudflare environments`
14. `docs: add operations and deployment guide`
