# Threat model

This document describes the demo architecture and the controls required before handling real trace data.

## Assets

- Submitted prompts and responses
- Trace metadata, token usage, latency, and estimated cost
- Ingestion and administrator API keys
- Review decisions and audit events
- Database credentials

## Trust boundaries

```text
External producer -> ingestion API -> database
Browser dashboard -> read/review API -> database
Environment/secret store -> application processes
```

## Main threats and controls

| Threat | Current control | Production follow-up |
| --- | --- | --- |
| Unauthorized trace submission | Constant-time comparison of an environment-provided ingestion key | Project-scoped hashed keys, rotation, rate limits |
| Unauthorized review mutation | Separate administrator key | Identity provider, short-lived sessions, role-based access |
| Credential leakage in findings | Evidence is redacted before it is returned | Redact before persistence and add DLP coverage |
| Cross-origin API abuse | Explicit configurable CORS allowlist | Restrict to exact deployed origins |
| Oversized payload denial of service | Typed request limits | Reverse-proxy body limits and rate limiting |
| Stored malicious text rendered as code | React text escaping; no raw HTML rendering | Content Security Policy and browser security regression tests |
| Database compromise | No committed secrets; least-data demo | Managed encryption, least-privilege role, backups, network policy |
| Audit-history tampering | Append-only application flow | Database permissions and tamper-evident export |

## Data handling

- Do not send real secrets or personal data to the public demo.
- Prompt and response capture should be opt-in in a production deployment.
- Logs must avoid request bodies and authentication headers.
- Retention and deletion policies must be defined before production use.

## Security limitations

The included pattern rules are educational guardrails, not a complete DLP or AI-safety system. A low risk score does not prove that an output is factual, safe, or policy compliant.
