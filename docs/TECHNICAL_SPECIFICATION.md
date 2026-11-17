# Kedah Community Connect — Technical Specification

**Document status:** Initial implementation specification  
**Project type:** Cloud-first, serverless web application  
**Primary objective:** Demonstrate practical cloud engineering through a useful community service platform.

## 1. Purpose

Kedah Community Connect (KCC) is a centralised platform for residents to report local infrastructure, cleanliness, drainage, lighting, and other community issues. It provides a traceable workflow from initial submission to investigation and resolution.

KCC is a portfolio prototype, not an official government service. Use fictional/demo data unless an authorised organisation explicitly approves real deployment and data collection.

## 2. Goals

### Functional goals
- Allow residents to register, sign in, submit issues, attach photographs, provide a location, and track their own reports.
- Allow administrators to review submissions, manage categories and departments, and assign reports.
- Allow department officers to see reports assigned to their department and record progress.
- Maintain status history and audit records.
- Provide dashboards and basic aggregate analytics.
- Provide a responsive and accessible user interface.

### Engineering goals
- Deploy a frontend and API using serverless cloud services where free allowances permit.
- Use a relational database and object storage.
- Apply server-side authentication, authorisation, and validation.
- Automate checks and deployment through CI/CD.
- Include tests, structured logs, error handling, and documentation.
- Keep the system modular so future AI and analytics capabilities can be added without redesigning the core.

### Non-goals for the MVP
- Official integration with local councils or government systems.
- Emergency dispatch or emergency-response guarantees.
- Payments, public chat, or social networking.
- Native mobile applications.
- Microservices or Kubernetes.
- AI-based decisions about urgency, validity, or responsibility.
- Publicly exposing residents' personal information or exact home addresses.

## 3. Users and permissions

### Resident
- Create and manage own account.
- Create a report.
- View only reports they are authorised to see (MVP default: own reports).
- View status history and public-facing updates.
- Cancel own report only while it is in an allowed early state.
- Cannot assign reports, change roles, or view internal notes.

### Administrator
- View and manage all reports.
- Verify or reject reports and provide a reason.
- Assign reports to departments and officers.
- Manage issue categories and departments.
- Manage user roles (with audit logging).
- View aggregate operational dashboards.
- Cannot view or change passwords.

### Department officer
- View reports assigned to their department or explicitly assigned to them.
- Update permitted workflow states.
- Add internal notes and public progress updates as separate fields/types.
- Upload resolution evidence.
- Cannot manage users, categories, or other departments.

**Security rule:** A role supplied by a browser is never trusted. Every protected API operation must determine the authenticated user and permissions on the server.

## 4. Issue categories

Seed initial categories:
- Roads and footpaths
- Street lighting
- Drainage and flooding
- Waste and cleanliness
- Public facilities
- Parks and public spaces
- Other

Categories should be stored in the database, not hard-coded throughout the application.

## 5. Report data and validation

A report should contain:
- Unique ID (UUID)
- Human-readable reference code
- Reporter user ID
- Category ID
- Title
- Description
- Latitude and longitude (optional for MVP, required only if the user chooses map location)
- General location description (optional)
- Status
- Priority (administrator-controlled; default `NORMAL`)
- Assigned department ID (nullable until assigned)
- Assigned officer ID (optional)
- Created and updated timestamps
- Resolved timestamp (nullable)

Validation:
- Title: 5–120 characters.
- Description: 20–3,000 characters.
- Coordinates: latitude between -90 and 90; longitude between -180 and 180.
- Limit attachment count and file size using configurable limits.
- Allow only explicitly supported image formats; verify actual content type and file signature where feasible.
- Generate storage object keys on the server; never trust a user-provided storage path.
- Reject malformed or unexpected fields.
- Escape/render user-generated text safely; do not interpret descriptions as HTML.

## 6. Status workflow

Allowed transitions should be centralised in a workflow service.

| From | To | Who may perform it | Required information |
|---|---|---|---|
| SUBMITTED | UNDER_REVIEW | Administrator | Optional review note |
| UNDER_REVIEW | ASSIGNED | Administrator | Department |
| UNDER_REVIEW | REJECTED | Administrator | Rejection reason |
| ASSIGNED | IN_PROGRESS | Assigned officer / authorised admin | Optional update |
| IN_PROGRESS | RESOLVED | Assigned officer / authorised admin | Resolution summary; evidence optional |
| IN_PROGRESS | REOPENED | Administrator | Reopening reason |
| RESOLVED | REOPENED | Administrator | Reopening reason |
| SUBMITTED | CANCELLED | Report owner / administrator | Optional reason |

The API must reject transitions not listed in the workflow. Each successful transition must atomically update the report and insert a status-history record. Use a database transaction where supported.

## 7. Functional requirements

### Authentication
- Register with email and password.
- Sign in and sign out.
- Hash passwords using a modern password-hashing library supported by the runtime; never store plaintext passwords.
- Use secure, HttpOnly, SameSite cookies for browser sessions where practical. Configure Secure cookies in production.
- Add rate limiting or equivalent abuse protection to authentication endpoints.
- Provide a password-reset flow only after an appropriate email provider is selected; do not pretend a reset email was sent if no provider is configured.
- Never allow public registration to create privileged roles.

### Reporting
- Create, view, and list reports.
- Upload attachments using a server-authorised upload flow.
- Filter reports by status, category, and date where permitted.
- Residents see only their own reports by default.
- Show public status history without exposing internal notes.

### Administration
- Search and filter all reports.
- Review and reject reports.
- Assign departments and officers.
- Manage categories and departments.
- View summary counts by status and category.

### Department operations
- List assigned work.
- Update work progress.
- Add internal notes and public updates.
- Mark work as resolved with a summary.
- Attach completion evidence.

### Notifications
MVP: show in-app notifications or a notification feed.
Later: integrate an email provider if a suitable free allowance and compliant configuration are available. Notification delivery should be asynchronous where possible, but core report creation must not fail solely because a notification provider is unavailable.

### Analytics
- Total reports.
- Reports by status.
- Reports by category.
- Reports created over time.
- Average time to resolution (only for resolved reports with valid timestamps).
- Reports by broad area, only when enough data exists to avoid exposing individual residents.

## 8. Non-functional requirements

- **Security:** least privilege, server-side RBAC, secure session handling, input validation, safe uploads, secret management.
- **Privacy:** collect only necessary information; avoid exposing exact personal addresses; provide a data-retention policy for the demo.
- **Reliability:** handle database and storage errors; return predictable API error responses.
- **Performance:** paginate lists; add indexes for common filters; avoid loading all reports at once.
- **Accessibility:** semantic HTML, keyboard navigation, visible focus, labels, and sufficient contrast.
- **Maintainability:** typed code, linting, formatting, modular services, migrations, and documentation.
- **Portability:** keep business logic independent of Cloudflare-specific APIs where reasonable.
- **Cost:** target free allowances; check current provider limits and avoid paid services.

## 9. Technology decisions

| Layer | Technology | Reason |
|---|---|---|
| UI | React + TypeScript + Vite | Component-based and strongly typed |
| Styling | Tailwind CSS | Consistent responsive UI |
| API framework | Hono | Lightweight TypeScript framework for Workers |
| Runtime | Cloudflare Workers | Serverless execution |
| Database | Cloudflare D1 | Managed SQLite-compatible SQL database |
| File storage | Cloudflare R2 | Object storage for images |
| Validation | Zod | Runtime request validation |
| Data access | D1 SQL through a small repository layer | Transparent SQL and controlled queries |
| Tests | Vitest and API integration tests | Fast feedback |
| CI/CD | GitHub Actions + Wrangler | Repeatable checks and deployment |
| Local development | Wrangler local mode / Miniflare-compatible tooling | Local Worker, D1, and R2 development |

Do not assume all services or features remain free forever. Confirm current pricing, quotas, regional availability, and terms before deployment.

## 10. Database design

### `users`
- `id` TEXT PRIMARY KEY
- `email` TEXT UNIQUE NOT NULL
- `display_name` TEXT NOT NULL
- `password_hash` TEXT NOT NULL
- `role` TEXT NOT NULL CHECK role in `RESIDENT`, `ADMIN`, `OFFICER`
- `department_id` TEXT NULL
- `is_active` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

### `departments`
- `id` TEXT PRIMARY KEY
- `name` TEXT UNIQUE NOT NULL
- `description` TEXT NULL
- `is_active` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT NOT NULL

### `categories`
- `id` TEXT PRIMARY KEY
- `name` TEXT UNIQUE NOT NULL
- `description` TEXT NULL
- `is_active` INTEGER NOT NULL DEFAULT 1

### `reports`
- `id` TEXT PRIMARY KEY
- `reference_code` TEXT UNIQUE NOT NULL
- `reporter_id` TEXT NOT NULL REFERENCES users(id)
- `category_id` TEXT NOT NULL REFERENCES categories(id)
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `location_label` TEXT NULL
- `latitude` REAL NULL
- `longitude` REAL NULL
- `status` TEXT NOT NULL
- `priority` TEXT NOT NULL DEFAULT 'NORMAL'
- `department_id` TEXT NULL REFERENCES departments(id)
- `assigned_officer_id` TEXT NULL REFERENCES users(id)
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `resolved_at` TEXT NULL

### `report_attachments`
- `id` TEXT PRIMARY KEY
- `report_id` TEXT NOT NULL REFERENCES reports(id)
- `uploaded_by` TEXT NOT NULL REFERENCES users(id)
- `object_key` TEXT UNIQUE NOT NULL
- `original_filename` TEXT NOT NULL
- `content_type` TEXT NOT NULL
- `size_bytes` INTEGER NOT NULL
- `created_at` TEXT NOT NULL

### `report_status_history`
- `id` TEXT PRIMARY KEY
- `report_id` TEXT NOT NULL REFERENCES reports(id)
- `actor_id` TEXT NOT NULL REFERENCES users(id)
- `from_status` TEXT NULL
- `to_status` TEXT NOT NULL
- `comment` TEXT NULL
- `created_at` TEXT NOT NULL

### `report_notes`
- `id` TEXT PRIMARY KEY
- `report_id` TEXT NOT NULL REFERENCES reports(id)
- `author_id` TEXT NOT NULL REFERENCES users(id)
- `body` TEXT NOT NULL
- `visibility` TEXT NOT NULL CHECK visibility in `INTERNAL`, `PUBLIC`
- `created_at` TEXT NOT NULL

### `audit_logs`
- `id` TEXT PRIMARY KEY
- `actor_id` TEXT NULL REFERENCES users(id)
- `action` TEXT NOT NULL
- `entity_type` TEXT NOT NULL
- `entity_id` TEXT NOT NULL
- `metadata_json` TEXT NULL
- `created_at` TEXT NOT NULL

### `notifications`
- `id` TEXT PRIMARY KEY
- `user_id` TEXT NOT NULL REFERENCES users(id)
- `report_id` TEXT NULL REFERENCES reports(id)
- `title` TEXT NOT NULL
- `body` TEXT NOT NULL
- `read_at` TEXT NULL
- `created_at` TEXT NOT NULL

Indexes to add:
- `reports(reporter_id, created_at)`
- `reports(status, created_at)`
- `reports(category_id, created_at)`
- `reports(department_id, status)`
- `report_status_history(report_id, created_at)`
- `report_notes(report_id, created_at)`
- `notifications(user_id, read_at, created_at)`

Use migrations for every schema change. Enable foreign-key enforcement where supported. Use parameterised SQL; never concatenate untrusted input into SQL.

## 11. API specification

Base path: `/api/v1`

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Reports
- `POST /reports`
- `GET /reports`
- `GET /reports/:reportId`
- `PATCH /reports/:reportId`
- `POST /reports/:reportId/cancel`
- `GET /reports/:reportId/history`
- `POST /reports/:reportId/attachments/upload-url` (or a Worker-proxied upload if signed upload URLs are not implemented)
- `GET /reports/:reportId/attachments`

### Administration
- `POST /admin/reports/:reportId/assign`
- `POST /admin/reports/:reportId/review`
- `POST /admin/reports/:reportId/reject`
- `GET /admin/analytics/summary`
- `GET /admin/users`
- `PATCH /admin/users/:userId/role`
- CRUD endpoints for categories and departments

### Department
- `GET /department/reports`
- `POST /department/reports/:reportId/status`
- `POST /department/reports/:reportId/notes`
- `POST /department/reports/:reportId/resolve`

### Notifications
- `GET /notifications`
- `POST /notifications/:notificationId/read`

API conventions:
- Use JSON for normal request and response bodies.
- Use consistent error format: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`.
- Return appropriate HTTP status codes.
- Paginate list endpoints using `limit` and `cursor` or a documented page scheme.
- Do not return password hashes, private notes, secrets, or internal storage credentials.
- Add request IDs to logs and error responses.

## 12. Upload design

Preferred pattern:
1. Authenticated client asks API for an upload authorisation.
2. API verifies report access and file constraints.
3. API generates a random object key.
4. Client uploads to R2 using a short-lived authorised mechanism if supported by the chosen implementation.
5. API records attachment metadata.
6. Downloads are authorised by the API; do not make private attachments public by default.

If direct authorised uploads are not feasible in the initial implementation, proxy a size-limited upload through the Worker for the MVP. Document the limits and avoid buffering large files in memory.

## 13. Security baseline

- Passwords must be hashed with a suitable password-hashing algorithm and parameters.
- Use secure, HttpOnly, SameSite cookies where applicable; protect state-changing cookie-authenticated requests against CSRF.
- Use HTTPS in deployment.
- Apply server-side RBAC and ownership checks on every protected resource.
- Rate-limit login and registration where practical.
- Validate body, query, route parameters, and uploaded files.
- Limit upload size and file count.
- Use random storage keys and private object access.
- Do not expose internal notes to residents.
- Avoid storing exact home addresses unless necessary.
- Keep secrets in deployment secrets, not source code or Wrangler files committed to Git.
- Do not log passwords, tokens, session cookies, or sensitive report content.
- Add security tests for horizontal privilege escalation and role bypass.
- Seed demo users only for local development; never ship default credentials in a public production deployment.

## 14. Testing strategy

- Unit tests: validation, workflow transition rules, permission policies, formatting helpers.
- API tests: authentication, report CRUD, assignment, status transitions, notes visibility, attachment metadata.
- Component tests: forms, report list, status timeline, role-specific navigation.
- End-to-end tests: resident submission through administrator assignment to department resolution.
- Security tests: resident cannot view another resident's report; officer cannot access unassigned department reports; resident cannot promote own role; internal notes remain private.
- Operational tests: missing database binding, storage failure, invalid environment configuration, and API error handling.

## 15. Acceptance criteria for MVP

- A resident can register and sign in.
- A resident can submit a valid report and see it in their report list.
- A resident cannot access another resident's private report by changing an ID.
- An administrator can review and assign a report.
- An officer can access only authorised assigned work.
- An officer can update progress and resolve a report.
- Each status change appears in history with actor and timestamp.
- Internal notes are not visible to residents.
- Attachments are stored outside the relational database and are access-controlled.
- Core flows have automated tests.
- The project can be run locally using documented commands.
- A deployment guide explains which services are genuinely deployed and which remain local.

## 16. Future extensions

- AI-assisted category suggestions (human confirmation required).
- Duplicate report suggestions.
- Geographic heatmaps using aggregated data.
- Service-level target monitoring.
- Email notifications through a provider selected after reviewing its free plan and terms.
- A Python analytics service if there is a clear need.
- Public dashboard showing only privacy-safe aggregate statistics.
