# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Report it privately through GitHub Security Advisories for this repository.

Include the affected endpoint or component, reproduction steps, impact, and any suggested mitigation. Do not include live credentials or personal data.

## Deployment notes

- Replace both demo API keys with independent high-entropy secrets.
- Restrict `CORS_ORIGINS` to the deployed dashboard origin.
- Terminate TLS at the hosting platform or reverse proxy.
- Use a managed PostgreSQL role with the minimum required privileges.
- Put the dashboard behind an identity provider before exposing non-demo trace data.
- Disable `TRUSTTRACE_PUBLIC_DEMO_READS`; production settings reject public demo mode.
- Disable `TRUSTTRACE_SEED_DEMO_DATA`; production settings reject synthetic seeding.
- Treat the included pattern checks as one defense layer, not a complete safety system.
