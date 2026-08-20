"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckIcon, ChevronIcon } from "@/components/icons";
import { formatDate, titleCase } from "@/lib/format";
import type { ReviewItem, ReviewStatus } from "@/lib/types";

export function ReviewQueue({ initialItems }: { initialItems: ReviewItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [message, setMessage] = useState("");
  const visible = useMemo(() => items.filter((item) => filter === "all" || item.status === filter), [items, filter]);

  function resolve(item: ReviewItem) {
    setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status: "resolved" } : candidate));
    setMessage(`${item.traceName} marked resolved in this demo session.`);
  }

  return (
    <>
      <div className="review-summary" role="group" aria-label="Review queue filters">
        {(["all", "open", "in_review", "resolved"] as const).map((status) => {
          const count = status === "all" ? items.length : items.filter((item) => item.status === status).length;
          return (
            <button key={status} type="button" className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
              <span>{titleCase(status)}</span><strong>{count}</strong>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
      <section className="review-list" aria-label="Human review items">
        {visible.map((item) => (
          <article className="review-card" key={item.id}>
            <div className={`priority-rail priority-${item.priority}`} />
            <div className="review-main">
              <div className="review-meta">
                <span className={`priority-label priority-${item.priority}`}>{item.priority}</span>
                <span>{item.id}</span><span>·</span><span>{formatDate(item.createdAt)}</span>
              </div>
              <h2>{item.traceName}</h2>
              <p>{item.reason}</p>
              <div className="review-detail-row">
                <span>Risk <strong>{item.riskScore}/100</strong></span>
                <span>Status <strong>{titleCase(item.status)}</strong></span>
                <span>Owner <strong>{item.assignee ?? "Unassigned"}</strong></span>
              </div>
            </div>
            <div className="review-actions">
              {item.status !== "resolved" ? (
                <button className="button button-secondary button-small" type="button" onClick={() => resolve(item)}><CheckIcon /> Resolve</button>
              ) : <span className="resolved-label"><CheckIcon /> Resolved</span>}
              <Link className="row-action" href={`/traces/${item.traceId}`} aria-label={`Open trace ${item.traceId}`}><ChevronIcon /></Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
