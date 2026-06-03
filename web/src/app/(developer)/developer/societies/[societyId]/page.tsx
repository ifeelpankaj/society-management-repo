import { notFound } from "next/navigation";

import { SocietyDetailClient } from "@/features/developer/societies";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Society details",
  "Review society profile, status, and subscription.",
);

type DeveloperSocietyDetailPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

function parseSocietyId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function DeveloperSocietyDetailPage({
  params,
}: DeveloperSocietyDetailPageProps) {
  const { societyId: societyIdParam } = await params;
  const societyId = parseSocietyId(societyIdParam);

  if (!societyId) {
    notFound();
  }

  return <SocietyDetailClient societyId={societyId} />;
}
