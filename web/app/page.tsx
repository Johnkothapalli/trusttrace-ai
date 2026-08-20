import Link from "next/link";
import { ArrowIcon, CheckIcon, ClockIcon, CoinIcon, ExternalIcon, ShieldIcon } from "@/components/icons";
import { MetricCard } from "@/components/metric-card";
import { RecentTraces } from "@/components/recent-traces";
import { RiskTrendChart } from "@/components/risk-trend-chart";
import { DataSourceBanner, PageHeader, RiskBadge } from "@/components/ui";
import { getOverview, getReviews, getRiskTrend, getTraces } from "@/lib/api";
import { formatCurrency, formatLatency, titleCase } from "@/lib/format";

export default async function OverviewPage() {
  const [overview, trend, traces, reviews] = await Promise.all([
    getOverview(),
    getRiskTrend(),
    getTraces(),
    getReviews(),
  ]);
  const warning = overview.warning ?? trend.warning ?? traces.warning ?? reviews.warning;
  const live = overview.source === "api";

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Production overview"
        title="AI systems, under control."
        description="Monitor quality, safety, latency, and cost across every model interaction."
        actions={
          <>
            <span className="date-filter"><span /> Last 7 days</span>
            <Link href="/docs" className="button button-primary">Instrument an app <ArrowIcon /></Link>
          </>
        }
      />
      <DataSourceBanner source={overview.source} warning={warning} />

      <section className="metric-grid" aria-label="Key AI operations metrics">
        <MetricCard label="Evaluation pass rate" value={`${overview.data.passRate}%`} change={live ? "Live" : `↑ ${overview.data.changes.passRate}%`} trend={live ? "neutral" : "positive"} context={live ? "current workspace" : "vs previous period"} icon={<CheckIcon />} />
        <MetricCard label="Safety flags" value={overview.data.safetyFlags.toString()} change={live ? "Live" : `↓ ${Math.abs(overview.data.changes.safetyFlags)}%`} trend={live ? "neutral" : "positive"} context={live ? "deterministic findings" : "vs previous period"} icon={<ShieldIcon />} />
        <MetricCard label="P95 latency" value={formatLatency(overview.data.p95LatencyMs)} change={live ? "Live" : `↓ ${Math.abs(overview.data.changes.p95LatencyMs)}ms`} trend={live ? "neutral" : "positive"} context={live ? "current workspace" : "faster this week"} icon={<ClockIcon />} />
        <MetricCard label="Estimated cost" value={formatCurrency(overview.data.estimatedCostUsd)} change={live ? "Live" : `↑ ${overview.data.changes.estimatedCostUsd}%`} trend="neutral" context={live ? `across ${overview.data.totalTraces.toLocaleString()} traces` : "across 18.4k traces"} icon={<CoinIcon />} />
      </section>

      <section className="overview-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div><h2>Guardrail activity</h2><p>Signals monitored and blocked before reaching users</p></div>
            <Link href="/traces" className="text-link">Explore traces <ExternalIcon /></Link>
          </div>
          <RiskTrendChart points={trend.data} />
        </article>

        <article className="panel posture-panel">
          <div className="panel-header"><div><h2>Safety posture</h2><p>Across active production policies</p></div></div>
          <div className="posture-score">
            <div className="score-ring"><span>92</span><small>/ 100</small></div>
            <div><strong>Strong coverage</strong><p>4 of 5 policy groups fully enforced</p></div>
          </div>
          <ul className="posture-list">
            <li><span className="posture-check"><CheckIcon /></span><span><strong>Prompt injection</strong><small>Blocking · 99.2% coverage</small></span></li>
            <li><span className="posture-check"><CheckIcon /></span><span><strong>PII & secrets</strong><small>Redacting · 97.8% coverage</small></span></li>
            <li><span className="posture-watch">!</span><span><strong>Groundedness</strong><small>Monitoring · raise to blocking</small></span></li>
          </ul>
          <Link href="/settings" className="button button-secondary button-wide">Review guardrail policy</Link>
        </article>
      </section>

      <section className="panel recent-panel" aria-labelledby="recent-traces-heading">
        <div className="panel-header">
          <div><h2 id="recent-traces-heading">Recent traces</h2><p>Latest model interactions across environments</p></div>
          <Link href="/traces" className="text-link">View all {overview.data.totalTraces.toLocaleString()} <ArrowIcon /></Link>
        </div>
        <RecentTraces traces={traces.data.slice(0, 6)} />
      </section>

      <section className="panel queue-preview" aria-labelledby="queue-preview-heading">
        <div className="panel-header">
          <div><h2 id="queue-preview-heading">Needs human review</h2><p>High-confidence flags waiting for an accountable decision</p></div>
          <Link href="/reviews" className="text-link">Open queue <ArrowIcon /></Link>
        </div>
        <div className="queue-preview-list">
          {reviews.data.filter((item) => item.status !== "resolved").slice(0, 3).map((item) => (
            <Link href={`/traces/${item.traceId}`} className="queue-preview-row" key={item.id}>
              <span className={`risk-score risk-score-${item.riskScore >= 90 ? "critical" : "high"}`}>{item.riskScore}</span>
              <span className="queue-preview-copy"><strong>{item.traceName}</strong><small>{item.reason}</small></span>
              <RiskBadge risk={item.riskScore >= 90 ? "critical" : "high"} />
              <span className="queue-status">{titleCase(item.status)}</span>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
