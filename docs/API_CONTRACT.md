# Kedah Community Connect — API Contract (`/api/v1`)

All endpoints return JSON (except attachment binary downloads) and include an `X-Request-Id` header.

## Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "requestId": "uuid"
  }
}
```

## Health & Reference

- `GET /api/v1/health` — Service health check
- `GET /api/v1/categories` — Active issue categories
- `GET /api/v1/departments` — Active service departments

## Authentication

- `POST /api/v1/auth/register` — Public resident registration (sets `kcc_session` HttpOnly cookie, returns `{ user, csrfToken }`)
- `POST /api/v1/auth/login` — Email/password login (sets `kcc_session` HttpOnly cookie, returns `{ user, csrfToken }`)
- `POST /api/v1/auth/logout` — Revokes active session (requires `X-CSRF-Token`)
- `GET /api/v1/auth/me` — Returns current authenticated user and CSRF token

## Reports

- `POST /api/v1/reports` — Create report (`RESIDENT` or `ADMIN`)
- `GET /api/v1/reports` — List reports scoped by role (`RESIDENT`: own; `OFFICER`: department/assigned; `ADMIN`: all)
- `GET /api/v1/reports/:reportId` — Get report detail, timeline, role-filtered notes, and attachment metadata
- `PATCH /api/v1/reports/:reportId` — Edit permitted fields while `SUBMITTED`
- `POST /api/v1/reports/:reportId/cancel` — Cancel own `SUBMITTED` report
- `GET /api/v1/reports/:reportId/history` — Immutable status history
- `POST /api/v1/reports/:reportId/attachments` — Multipart image upload (`image/jpeg`, `image/png`, `image/webp`, max 5 MiB, max 5 files)
- `GET /api/v1/reports/:reportId/attachments` — List attachment metadata
- `GET /api/v1/reports/:reportId/attachments/:attachmentId` — Authorised private attachment download

## Administration (`ADMIN` only)

- `POST /api/v1/admin/reports/:reportId/review` — Move `SUBMITTED → UNDER_REVIEW`
- `POST /api/v1/admin/reports/:reportId/reject` — Move `UNDER_REVIEW → REJECTED` with reason
- `POST /api/v1/admin/reports/:reportId/assign` — Assign department (and optional officer/priority)
- `POST /api/v1/admin/reports/:reportId/reopen` — Reopen `IN_PROGRESS` or `RESOLVED` report with reason
- `GET /api/v1/admin/analytics/summary` — Aggregate status, category, resolution time, and daily counts
- `GET /api/v1/admin/users` — Paginated user list
- `PATCH /api/v1/admin/users/:userId/role` — Update user role with audit log
- `GET/POST/PATCH /api/v1/admin/categories` & `/api/v1/admin/departments` — Manage reference data

## Department Operations (`OFFICER` or `ADMIN`)

- `GET /api/v1/department/reports` — Department/officer work queue
- `POST /api/v1/department/reports/:reportId/status` — Transition `ASSIGNED → IN_PROGRESS`
- `POST /api/v1/department/reports/:reportId/notes` — Add `PUBLIC` or `INTERNAL` note
- `POST /api/v1/department/reports/:reportId/resolve` — Transition `IN_PROGRESS → RESOLVED` with summary

## Notifications

- `GET /api/v1/notifications` — Paginated user notifications
- `POST /api/v1/notifications/:notificationId/read` — Mark notification as read
