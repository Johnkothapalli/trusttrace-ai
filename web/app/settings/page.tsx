import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="page-container">
      <PageHeader eyebrow="Workspace configuration" title="Settings" description="Manage deterministic guardrails, ingestion credentials, and workspace defaults." />
      <SettingsForm />
      <section className="panel workspace-details">
        <div className="panel-header"><div><h2>Workspace details</h2><p>Public demo environment</p></div></div>
        <dl><div><dt>Name</dt><dd>Acme AI</dd></div><div><dt>Environment</dt><dd><span className="demo-chip">Demo</span></dd></div><div><dt>Data retention</dt><dd>7 days (simulated)</dd></div><div><dt>Region</dt><dd>Local demo dataset</dd></div></dl>
      </section>
    </div>
  );
}
