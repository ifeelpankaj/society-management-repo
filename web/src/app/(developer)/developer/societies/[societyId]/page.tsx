import { notFound } from "next/navigation";

import { SocietyDetailClient } from "@/features/developer/societies";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Society details",
  "Review society profile, status, and subscription.",
);
//getV1SocietiesBySocietyId to get society details
//patchV1SocietiesBySocietyId to update society details like name and address
//postV1SocietiesBySocietyIdApprove to approve society if pending
//postV1SocietiesBySocietyIdReject to reject society if pending once rejected nothing an
//deleteV1SocietiesBySocietyId to delete society
//postV1SocietiesBySocietyIdRestore to restore deleted society
//postV1SocietiesBySocietyIdSuspend to suspend society if active
//postV1SocietiesBySocietyIdReactivate to reactivate society if suspended
//postV1SocietiesBySocietyIdTransferOwnership to transfer society ownership to another user
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
