import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { EvaluationComparison } from "@/components/evaluation-comparison";
import { DataSourceBanner, PageHeader } from "@/components/ui";
import { getExperiment } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Evaluations" };

export default async function EvaluationsPage() {
  const result = await getExperiment();
  const experiment = result.data;
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Quality engineering"
        title="Evaluation lab"
        description="Compare prompt and model variants against the same versioned test set before shipping."
        actions={<Link className="button button-primary" href="/docs">Evaluation API <ArrowIcon /></Link>}
      />
      <DataSourceBanner source={result.source} warning={result.warning} />

      <section className="panel experiment-header">
        <div>
          <div className="experiment-meta"><span className="complete-pill"><CheckIcon /> Complete</span><span>Updated {formatDate(experiment.updatedAt)}</span></div>
          <h2>{experiment.name}</h2>
          <p>{experiment.description}</p>
        </div>
        <span className="experiment-id">{experiment.id}</span>
      </section>

      <EvaluationComparison experiment={experiment} />

      <section className="panel decision-panel">
        <div className="decision-mark"><CheckIcon /></div>
        <div><h2>Candidate is safe to promote</h2><p>Variant B improves quality by 5.2 points and safety by 3.3 points while reducing P95 latency and average cost.</p></div>
        <Link className="button button-primary" href="/docs">View integration guide</Link>
      </section>

      <section className="panel methodology-panel">
        <div className="panel-header"><div><h2>Evaluation methodology</h2><p>Reproducible evidence behind this comparison</p></div><Link href="/docs" className="text-link">Read the guide <ArrowIcon /></Link></div>
        <div className="methodology-grid">
          <div><span>01</span><h3>Versioned dataset</h3><p>1,200 support cases covering policy, retrieval, refusal, and escalation scenarios.</p></div>
          <div><span>02</span><h3>Deterministic safety</h3><p>Prompt injection, PII, secret, and unsupported-decision checks use declared rules.</p></div>
          <div><span>03</span><h3>Quality rubric</h3><p>Correctness, groundedness, relevance, and tone are scored against reference criteria.</p></div>
        </div>
      </section>
    </div>
  );
}
