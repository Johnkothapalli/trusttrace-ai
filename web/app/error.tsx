"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="page-container error-page">
      <span>Unexpected error</span><h1>TrustTrace could not load this view.</h1><p>The public demo normally falls back to local data. Retry the page, or return to the overview.</p>
      <div><button className="button button-primary" onClick={reset}>Try again</button><Link className="button button-secondary" href="/">Go to overview</Link></div>
    </div>
  );
}
