# Architecture

TrustTrace is a two-service application with one persistence layer. The public web demo is useful without infrastructure, while the complete write and review workflow runs against the API.

```text
AI application / curl client
           |
           | POST /api/v1/traces + ingestion key
           v
     FastAPI service
       |         |
       |         +--> deterministic guardrail rules
       |                    |
       |                    +--> explainable, redacted findings
       v
 SQLAlchemy session
       |
       +--> PostgreSQL in Docker
       +--> SQLite for zero-config local API work
       |
       +--> traces
       +--> review queue
       +--> append-only audit events

Next.js dashboard --server-side JSON fetch--> FastAPI
       |
       +--> typed synthetic fallback when the API is not configured/reachable
```

## Web application

The Next.js App Router application uses React Server Components for initial data reads and small client components only where interaction is required, such as the mobile navigation, copy action, filters, and review controls.

All API responses are mapped into frontend domain types in `web/lib/api.ts`. Network access has a short timeout and a deliberate synthetic-data fallback. The interface always exposes whether it is showing the live API or the demo workspace; fallback data is not presented as production traffic.

## API

FastAPI owns request validation, write authentication, evaluation, review state, and the OpenAPI contract. SQLAlchemy models keep filterable operational fields relational while storing finding evidence and provider-specific metadata as JSON.

Trace ingestion is synchronous in this release:

1. Validate the typed payload.
2. Authenticate `X-TrustTrace-Key` using constant-time comparison.
3. Run the deterministic rule set.
4. Persist the trace and explainable findings in one transaction.
5. Create a review item when the risk score fails the threshold.
6. Append a trace-ingested audit event.

The unique `(workspace_id, external_id)` constraint makes producer-supplied trace identifiers idempotent at the database boundary; a duplicate receives HTTP 409.

## Read and write access

The seeded development workspace allows anonymous reads so the portfolio demo can be explored. Ingestion and review mutations require different keys. Production configuration refuses to start while public demo reads are enabled, while keys are weak/demo values, or while the two keys are identical.

This is a scoped portfolio authentication model, not a replacement for end-user identity or role-based access control. A production system should add an identity provider, project-scoped hashed keys, rotation, rate limiting, and tenant isolation policies.

## Guardrail engine

The engine is a deterministic policy layer. It identifies pattern-based signals for:

- prompt-injection language;
- email, telephone, and payment-card-shaped PII;
- credential and private-key-shaped values;
- narrowly defined unsafe-output phrases.

Each finding records a rule code, category, severity, location, confidence assigned to the rule, and redacted evidence. The aggregate score is a prioritization aid; it does not establish factuality, safety, legal compliance, or intent.

## Operational trade-offs

- Synchronous evaluation makes the workflow easy to run and reason about, but a queue/worker would be appropriate for expensive or custom policies.
- SQLite reduces contributor setup; PostgreSQL is the composed and production-shaped path.
- Synthetic fallback keeps the public UI reliable; integration tests and visible source labels prevent it from silently masquerading as live data.
- Non-demo API keys are loaded from the environment; committed demo values are intentionally non-secret. A production version should store only per-project key hashes.
- Demo audit actors identify generic service roles, not individual authenticated users.
