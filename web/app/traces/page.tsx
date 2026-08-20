import type { Metadata } from "next";
import Link from "next/link";
import { DocsIcon } from "@/components/icons";
import { TraceExplorer } from "@/components/trace-explorer";
import { DataSourceBanner, PageHeader } from "@/components/ui";
import { getTraces } from "@/lib/api";

export const metadata: Metadata = { title: "Traces" };

export default async function TracesPage() {
  const traces = await getTraces();
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Observability"
        title="Trace explorer"
        description="Inspect every model call, guardrail decision, evaluation, token, and millisecond."
        actions={<Link href="/docs" className="button button-secondary"><DocsIcon /> API reference</Link>}
      />
      <DataSourceBanner source={traces.source} warning={traces.warning} />
      <TraceExplorer traces={traces.data} />
    </div>
  );
}
