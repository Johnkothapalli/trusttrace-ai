# TrustTrace API

FastAPI service for storing AI application traces, running transparent deterministic
guardrails, and managing human review. The scanner uses documented pattern matching and
weighted rules; it is not presented as an ML model.

## Run locally

```bash
python -m venv .venv
python -m pip install -e ".[dev,postgres]"
uvicorn app.main:app --reload
```

The API starts with synthetic demo data at `http://localhost:8000`. Interactive API docs are
available at `/docs`. Development write keys are documented in `.env.example` at repository
root and should always be replaced outside local development.

To seed an existing database explicitly:

```bash
trusttrace-seed
```

The command is idempotent: it only inserts demo traces that are not already present.
