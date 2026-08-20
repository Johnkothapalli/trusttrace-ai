# Product brief

## Problem

Teams can ship AI-assisted features quickly, but an HTTP 200 does not mean the output was safe, private, useful, or within the expected latency and cost envelope. Raw provider logs also make it difficult to explain why a trace was flagged and what a reviewer did next.

TrustTrace provides a small, inspectable operations layer for this problem. It accepts AI-operation traces, runs deterministic guardrail checks, aggregates reliability metrics, and sends risky traces to a human review queue with an audit trail.

## Why this project now

- TypeScript became GitHub's most-used language in August 2025, while Python remained dominant for AI and data-science workloads. [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)
- AI and big data, followed by networks and cybersecurity, are among the fastest-growing skill areas identified in the World Economic Forum's 2025 jobs outlook. [World Economic Forum](https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/)
- AI reliability remains a trust problem for developers, which makes observability and human review more useful than another generic chat interface. [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/ai)

## Primary user

An application engineer or small platform team operating an LLM-backed feature who needs to answer:

1. Which requests are failing or becoming slow?
2. Which traces contain explainable safety or privacy signals?
3. What should a human review first?
4. Who changed a review decision, and when?

## MVP workflows

1. Submit a trace with a scoped ingestion key.
2. Inspect deterministic findings and a calculated risk score.
3. Filter and open traces from the dashboard.
4. Move flagged traces through a human review workflow.
5. Compare models or experiments using pass rate, latency, and estimated cost.
6. Inspect append-only audit events for review mutations.

## Product principles

- **Explain the signal.** Every flag identifies its category, severity, confidence, and redacted evidence.
- **Keep humans in control.** TrustTrace prioritizes review work; it does not autonomously block or remediate production requests.
- **Use honest language.** Pattern checks are deterministic heuristics. Estimated cost is labelled as estimated. The demo data is synthetic.
- **Work without paid APIs.** The complete local demo does not require an LLM provider key.
- **Default to safer examples.** Seeded content demonstrates risks without storing real credentials or personal information.

## Out of scope

- Hallucination or factual-truth detection
- Autonomous remediation
- Complete OWASP or regulatory compliance
- Provider billing reconciliation
- Production-scale or customer claims
- Enterprise identity, billing, and organization administration
