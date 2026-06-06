import { notFound } from "next/navigation";

import { SubscriptionDetailClient } from "@/features/developer/subscriptions/components/subscription-detail-client";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Subscription details",
  "Manage subscription lifecycle and billing.",
);

type SubscriptionDetailPageProps = {
  params: Promise<{ subscriptionId: string }>;
};

export default async function SubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  const { subscriptionId: rawId } = await params;
  const subscriptionId = Number.parseInt(rawId, 10);

  if (!/^\d+$/.test(rawId) || subscriptionId <= 0) {
    notFound();
  }

  return <SubscriptionDetailClient subscriptionId={subscriptionId} />;
}
