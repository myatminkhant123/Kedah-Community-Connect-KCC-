# Architecture Decision Records (Initial)

## ADR-001: Use a serverless modular monolith
**Decision:** One Hono API Worker with separated modules and services.

**Reason:** Keeps the project deployable and understandable while demonstrating serverless cloud engineering. Microservices would add complexity before scale or team boundaries justify them.

## ADR-002: Use Cloudflare D1 for the MVP database
**Decision:** Use D1 with SQLite-compatible SQL and migrations.

**Reason:** Fits the Cloudflare serverless stack and is suitable for a portfolio-scale application. The repository layer should reduce coupling to D1.

**Trade-off:** D1 is not PostgreSQL. Advanced PostgreSQL-specific features and SQL syntax cannot be assumed.

## ADR-003: Use R2 for private report attachments
**Decision:** Store image objects in R2 and metadata in D1.

**Reason:** Object storage is a better fit for uploaded files than storing binary data in relational rows.

**Trade-off:** Upload authorisation, private access, file validation, and quota management must be designed carefully.

## ADR-004: Use TypeScript for the application
**Decision:** Use TypeScript across frontend and backend.

**Reason:** Shared domain contracts, one primary language, and direct fit with Workers/Hono.

**Trade-off:** Python is not the primary API language in this version. It can be introduced later for a clearly separated analytics or ML use case.

## ADR-005: Target free allowances, not guaranteed free hosting
**Decision:** Build locally first and deploy only within verified free-plan allowances.

**Reason:** The project must not depend on a paid Azure subscription or unexpected monthly spend.

**Trade-off:** Provider limits and terms may change. The deployment may need to remain a local demonstration if the account cannot use a required service without payment.
