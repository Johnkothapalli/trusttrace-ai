import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { CheckIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "API docs" };

const curlSample = `curl -X POST http://localhost:8000/api/v1/traces \\
  -H "Content-Type: application/json" \\
  -H "X-TrustTrace-Key: tt_demo_ingest_change_me" \\
  -d '{
    "external_id": "support-assistant-001",
    "provider": "openai",
    "model": "gpt-5-mini",
    "environment": "production",
    "prompt": "How do I return an order?",
    "response": "Open Orders and select Start a return.",
    "latency_ms": 842,
    "input_tokens": 213,
    "output_tokens": 56,
    "estimated_cost_usd": 0.0021
  }'`;

const tsSample = `const response = await fetch(
  "http://localhost:8000/api/v1/traces",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TrustTrace-Key": process.env.TRUSTTRACE_API_KEY!,
    },
    body: JSON.stringify(trace),
  }
);`;

export default function DocsPage() {
  return (
    <div className="page-container docs-page">
      <PageHeader eyebrow="Developer quickstart" title="Instrument your first trace" description="Send a completed model interaction to TrustTrace and receive deterministic safety signals in the response." />
      <div className="docs-layout">
        <article className="docs-content">
          <section id="start">
            <span className="step-number">01</span><h2>Start the stack</h2><p>Docker Compose starts PostgreSQL, the FastAPI service, and this Next.js dashboard with sensible local defaults.</p>
            <CodeBlock value={`docker compose up --build`} />
          </section>
          <section id="send">
            <span className="step-number">02</span><h2>Send a trace</h2><p>Use the dedicated ingestion key when sending model inputs and outputs. The single-workspace demo key below is non-secret.</p>
            <div className="language-label">cURL</div><CodeBlock value={curlSample} />
            <div className="language-label">TypeScript</div><CodeBlock value={tsSample} />
          </section>
          <section id="response">
            <span className="step-number">03</span><h2>Inspect the decision</h2><p>The API returns declared detector results, a trace identifier, and whether human review is required.</p>
            <CodeBlock value={`{
  "id": "tr_8d1f2a",
  "external_id": "support-assistant-001",
  "risk_score": 8,
  "risk_level": "low",
  "evaluation_passed": true,
  "findings": [],
  "review_status": null
}`} />
          </section>
        </article>
        <aside className="docs-aside">
          <div className="panel docs-toc"><strong>On this page</strong><a href="#start">Start the stack</a><a href="#send">Send a trace</a><a href="#response">Inspect the decision</a></div>
          <div className="panel honest-note"><span><CheckIcon /></span><div><strong>Honest by design</strong><p>TrustTrace labels rule-based detections as deterministic. It never presents seeded demo metrics as live production evidence.</p></div></div>
        </aside>
      </div>
    </div>
  );
}

function CodeBlock({ value }: { value: string }) {
  return <div className="code-block"><CopyButton value={value} /><pre><code>{value}</code></pre></div>;
}
