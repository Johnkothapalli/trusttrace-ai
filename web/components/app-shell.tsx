"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CloseIcon,
  DocsIcon,
  EvaluationIcon,
  LogoMark,
  MenuIcon,
  OverviewIcon,
  ReviewIcon,
  SettingsIcon,
  TraceIcon,
} from "@/components/icons";

const workspaceLinks = [
  { href: "/", label: "Overview", icon: OverviewIcon },
  { href: "/traces", label: "Traces", icon: TraceIcon },
  { href: "/reviews", label: "Review queue", icon: ReviewIcon, count: 3 },
  { href: "/evaluations", label: "Evaluations", icon: EvaluationIcon },
];

const productLinks = [
  { href: "/docs", label: "API docs", icon: DocsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="mobile-header">
        <Link href="/" className="mobile-brand" aria-label="TrustTrace overview">
          <LogoMark />
          <span>TrustTrace</span>
        </Link>
        <button
          ref={menuButtonRef}
          className="icon-button"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="primary-sidebar"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {mobileOpen ? (
        <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      ) : null}

      <aside id="primary-sidebar" className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="brand-row">
          <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
            <LogoMark className="brand-mark" />
            <span>
              <strong>TrustTrace</strong>
              <small>AI control plane</small>
            </span>
          </Link>
          <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="workspace-switcher" aria-label="Current workspace">
          <span className="workspace-avatar">AC</span>
          <span className="workspace-copy">
            <strong>Acme AI</strong>
            <small>Demo workspace</small>
          </span>
          <span className="demo-chip">Demo</span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {workspaceLinks.map(({ href, label, icon: Icon, ...link }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(pathname, href) ? "active" : ""}`}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />
              <span>{label}</span>
              {link.count ? <span className="nav-count">{link.count}</span> : null}
            </Link>
          ))}

          <p className="nav-label nav-label-product">Product</p>
          {productLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(pathname, href) ? "active" : ""}`}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="service-status"><span className="status-dot" /> All systems operational</div>
          <div className="user-row">
            <span className="user-avatar">JK</span>
            <span><strong>John Kothapalli</strong><small>Workspace owner</small></span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
