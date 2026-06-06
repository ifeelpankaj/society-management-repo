import { notFound } from "next/navigation";

import { PlanDetailClient } from "@/features/developer/plans/components/plan-detail-client";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Plan details",
  "Edit and manage a subscription plan.",
);

type PlanDetailPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { planId: rawPlanId } = await params;
  const planId = Number.parseInt(rawPlanId, 10);

  if (!/^\d+$/.test(rawPlanId) || planId <= 0) {
    notFound();
  }

  return <PlanDetailClient planId={planId} />;
}
