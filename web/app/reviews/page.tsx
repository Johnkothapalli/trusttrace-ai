import type { Metadata } from "next";
import { ReviewQueue } from "@/components/review-queue";
import { DataSourceBanner, PageHeader } from "@/components/ui";
import { getReviews } from "@/lib/api";

export const metadata: Metadata = { title: "Review queue" };

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return (
    <div className="page-container">
      <PageHeader eyebrow="Human oversight" title="Review queue" description="Resolve high-confidence safety signals with a clear, accountable decision trail." />
      <DataSourceBanner source={reviews.source} warning={reviews.warning} />
      <ReviewQueue initialItems={reviews.data} />
    </div>
  );
}
