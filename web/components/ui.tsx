import type { ReactNode } from "react";
import { AlertIcon } from "@/components/icons";
import type { DataSource, RiskLevel, TraceStatus } from "@/lib/types";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function DataSourceBanner({ source, warning }: { source: DataSource; warning?: string }) {
  return (
    <div className={`source-banner ${warning ? "source-warning" : ""}`} role={warning ? "status" : undefined}>
      <span className="source-icon"><AlertIcon /></span>
      <p>
        <strong>{source === "api" ? "Live API connected" : "Interactive demo workspace"}</strong>
        <span>
          {warning
            ? ` Live API unavailable (${warning}); showing the built-in dataset.`
            : source === "api"
              ? " Metrics refresh from the TrustTrace API every 30 seconds."
              : " This public demo uses realistic seeded traces; no customer data or model calls are used."}
        </span>
      </p>
      <span className="source-badge">{source === "api" ? "Live" : "Demo data"}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: TraceStatus }) {
  return <span className={`badge badge-${status}`}><span />{status}</span>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-${risk}`}>{risk}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true">⌁</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
