import Link from "next/link";

export default function NotFound() {
  return <div className="page-container error-page"><span>404</span><h1>That trace does not exist.</h1><p>It may have expired under the workspace retention policy or the ID may be incorrect.</p><Link className="button button-primary" href="/traces">Back to traces</Link></div>;
}
