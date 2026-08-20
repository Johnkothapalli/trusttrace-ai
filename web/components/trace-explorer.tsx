"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { filterTraces } from "@/lib/format";
import type { RiskLevel, Trace } from "@/lib/types";
import { EmptyState } from "@/components/ui";
import { RecentTraces } from "@/components/recent-traces";

const riskOptions: Array<{ value: RiskLevel | "all"; label: string }> = [
  { value: "all", label: "All risk" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function TraceExplorer({ traces }: { traces: Trace[] }) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const filtered = useMemo(() => filterTraces(traces, query, risk), [traces, query, risk]);

  return (
    <section className="panel explorer-panel" aria-labelledby="all-traces-heading">
      <div className="panel-header explorer-header">
        <div>
          <h2 id="all-traces-heading">All traces</h2>
          <p>{filtered.length} of {traces.length} traces</p>
        </div>
        <div className="filter-row">
          <label className="search-field">
            <span className="sr-only">Search traces</span>
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, model, or use case" />
          </label>
          <label className="select-field">
            <span className="sr-only">Filter by risk</span>
            <select value={risk} onChange={(event) => setRisk(event.target.value as RiskLevel | "all")}>
              {riskOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>
      {filtered.length ? <RecentTraces traces={filtered} /> : <EmptyState title="No matching traces" description="Try a different search term or risk filter." />}
    </section>
  );
}
