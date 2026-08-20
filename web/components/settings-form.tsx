"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

function Toggle({ label, description, initial = true }: { label: string; description: string; initial?: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  return (
    <div className="toggle-row">
      <span><strong>{label}</strong><small>{description}</small></span>
      <button type="button" className={`toggle ${enabled ? "enabled" : ""}`} role="switch" aria-checked={enabled} aria-label={label} onClick={() => setEnabled((value) => !value)}><span /></button>
    </div>
  );
}

export function SettingsForm() {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [demoKey, setDemoKey] = useState("tt_demo_ingest_change_me");

  async function copyKey() {
    await navigator.clipboard.writeText(demoKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <div className="panel-header"><div><h2>Guardrail policy</h2><p>Applied to production traces before output delivery</p></div><span className="policy-version">v4</span></div>
        <div className="toggle-list">
          <Toggle label="Prompt injection" description="Block instruction override and system-prompt extraction patterns." />
          <Toggle label="PII redaction" description="Detect and mask emails, phone numbers, and payment identifiers." />
          <Toggle label="Secret detection" description="Block API keys, tokens, and credential-shaped strings." />
          <Toggle label="Unsupported decisions" description="Route high-impact autonomous decisions to human review." initial={false} />
        </div>
        <div className="settings-footer"><span>{saved ? "Saved in this demo session." : "Changes only affect this browser demo."}</span><button className="button button-primary" type="button" onClick={() => setSaved(true)}>{saved ? <CheckIcon /> : null} Save policy</button></div>
      </section>

      <section className="panel settings-panel">
        <div className="panel-header"><div><h2>Workspace API key</h2><p>Use this demo key to understand the ingestion flow</p></div></div>
        <div className="api-key-row"><code>{demoKey}</code><button type="button" onClick={copyKey}>{copied ? <CheckIcon /> : <CopyIcon />}{copied ? "Copied" : "Copy demo key"}</button></div>
        <div className="key-notice"><strong>Demo credential only</strong><p>This key is intentionally non-secret and cannot access a production workspace. Real keys are only shown once.</p></div>
        <button className="button button-secondary" type="button" onClick={() => setDemoKey(`tt_demo_${crypto.randomUUID().slice(0, 12)}`)}>Rotate demo key</button>
      </section>
    </div>
  );
}
