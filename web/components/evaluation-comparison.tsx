import { CheckIcon } from "@/components/icons";
import { formatCompactCurrency, formatLatency } from "@/lib/format";
import type { EvaluationExperiment, EvaluationVariant } from "@/lib/types";

function scoreRows(variant: EvaluationVariant) {
  return [
    { label: "Quality score", value: `${variant.quality}%`, width: variant.quality },
    { label: "Safety pass rate", value: `${variant.safety}%`, width: variant.safety },
  ];
}

export function EvaluationComparison({ experiment }: { experiment: EvaluationExperiment }) {
  return (
    <section className="comparison-grid" aria-label="Evaluation variant comparison">
      {experiment.variants.map((variant) => {
        const winner = variant.id === experiment.winnerId;
        return (
          <article key={variant.id} className={`variant-card ${winner ? "winner" : ""}`}>
            {winner ? <span className="winner-badge"><CheckIcon /> Recommended</span> : <span className="baseline-badge">Baseline</span>}
            <div className="variant-title">
              <span>{variant.name.slice(0, 1)}</span>
              <div><h2>{variant.name}</h2><p>{variant.model} · prompt {variant.promptVersion}</p></div>
            </div>
            <div className="score-stack">
              {scoreRows(variant).map((row) => (
                <div className="score-row" key={row.label}>
                  <div><span>{row.label}</span><strong>{row.value}</strong></div>
                  <div className="score-track"><span style={{ width: `${row.width}%` }} /></div>
                </div>
              ))}
            </div>
            <dl className="variant-stats">
              <div><dt>P95 latency</dt><dd>{formatLatency(variant.p95LatencyMs)}</dd></div>
              <div><dt>Average cost</dt><dd>{formatCompactCurrency(variant.avgCostUsd)}</dd></div>
              <div><dt>Dataset</dt><dd>{variant.sampleSize.toLocaleString()} cases</dd></div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}
