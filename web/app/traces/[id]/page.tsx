import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, CheckIcon, ClockIcon, CoinIcon, ShieldIcon } from "@/components/icons";
import { DataSourceBanner, RiskBadge, StatusBadge } from "@/components/ui";
import { getTrace } from "@/lib/api";
import { formatCompactCurrency, formatDate, formatLatency, titleCase } from "@/lib/format";

type TraceDetailProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: TraceDetailProps): Promise<Metadata> {
  const { id } = await params;
  const trace = await getTrace(id);
  return { title: trace.data ? trace.data.name : "Trace not found" };
}

export default async function TraceDetailPage({ params }: TraceDetailProps) {
  const { id } = await params;
  const result = await getTrace(id);
  if (!result.data) notFound();
  const trace = result.data;

  return (
    <div className="page-container trace-detail-page">
      <div className="breadcrumb"><Link href="/traces">Traces</Link><span>/</span><span>{trace.id}</span></div>
      <header className="trace-heading">
        <div>
          <div className="trace-heading-meta"><StatusBadge status={trace.status} /><RiskBadge risk={trace.riskLevel} /><span>{trace.environment}</span></div>
          <h1>{trace.name}</h1>
          <p>{formatDate(trace.startedAt)} · {trace.provider} / {trace.model}</p>
        </div>
        <Link href="/reviews" className="button button-secondary">Open review queue <ArrowIcon /></Link>
      </header>
      <DataSourceBanner source={result.source} warning={result.warning} />

      <section className="trace-stat-grid" aria-label="Trace metrics">
        <div><span><ShieldIcon /> Risk score</span><strong>{trace.riskScore}<small>/100</small></strong></div>
        <div><span><CheckIcon /> Evaluation</span><strong>{trace.evaluationScore}<small>%</small></strong></div>
        <div><span><ClockIcon /> Latency</span><strong>{formatLatency(trace.latencyMs)}</strong></div>
        <div><span><CoinIcon /> Cost</span><strong>{formatCompactCurrency(trace.costUsd)}</strong></div>
      </section>

      <div className="trace-content-grid">
        <div className="trace-main-column">
          <section className="panel conversation-panel">
            <div className="panel-header"><div><h2>Model interaction</h2><p>Captured input and output for this trace</p></div></div>
            <div className="message-block"><span className="message-label">Input</span><p>{trace.input}</p></div>
            <div className="message-block output"><span className="message-label">Output</span><p>{trace.output}</p></div>
          </section>

          <section className="panel signal-panel">
            <div className="panel-header"><div><h2>Deterministic guardrail results</h2><p>Pattern and policy checks — these are not model-generated classifications</p></div><span className="signal-count">{trace.signals.length} signal{trace.signals.length === 1 ? "" : "s"}</span></div>
            {trace.signals.length ? (
              <div className="signal-list">
                {trace.signals.map((signal) => (
                  <article key={signal.id} className={`signal-card severity-${signal.severity}`}>
                    <div className="signal-card-top"><span className="signal-icon"><ShieldIcon /></span><div><p>{titleCase(signal.category)}</p><h3>{signal.label}</h3></div><span className={`severity-label severity-${signal.severity}`}>{signal.severity}</span></div>
                    <dl><div><dt>Detector</dt><dd>{titleCase(signal.detector)}</dd></div><div><dt>Confidence</dt><dd>{Math.round(signal.confidence * 100)}%</dd></div></dl>
                    <p className="evidence"><strong>Evidence</strong>{signal.evidence}</p>
                    <p className="recommendation"><strong>Recommended action</strong>{signal.recommendation}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="all-clear"><span><CheckIcon /></span><div><h3>No deterministic signals detected</h3><p>Input and output passed the configured prompt-injection, PII, secret, and unsafe-output rules.</p></div></div>
            )}
          </section>
        </div>

        <aside className="trace-side-column">
          <section className="panel timeline-panel">
            <div className="panel-header"><div><h2>Execution timeline</h2><p>Total {formatLatency(trace.latencyMs)}</p></div></div>
            <ol className="stage-list">
              {trace.stages.map((stage) => (
                <li key={stage.label} className={stage.status}><span className="stage-dot">{stage.status === "complete" ? <CheckIcon /> : "!"}</span><span><strong>{stage.label}</strong><small>{stage.durationMs}ms</small></span></li>
              ))}
            </ol>
          </section>
          <section className="panel token-panel">
            <div className="panel-header"><div><h2>Usage</h2><p>Token accounting</p></div></div>
            <dl><div><dt>Input tokens</dt><dd>{trace.inputTokens.toLocaleString()}</dd></div><div><dt>Output tokens</dt><dd>{trace.outputTokens.toLocaleString()}</dd></div><div><dt>Total</dt><dd>{(trace.inputTokens + trace.outputTokens).toLocaleString()}</dd></div></dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
