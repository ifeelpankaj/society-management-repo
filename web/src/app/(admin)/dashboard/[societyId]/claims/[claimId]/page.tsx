import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Claim review",
  "Review and resolve a flat claim request.",
);

const ClaimDetailClient = dynamic(
  () =>
    import("@/features/admin/claims/components/claim-detail-client").then(
      (m) => ({
        default: m.ClaimDetailClient,
      }),
    ),
  { loading: () => <AppLoader label="Loading claim" /> },
);

type ClaimDetailPageProps = {
  params: Promise<{
    societyId: string;
    claimId: string;
  }>;
};

export default async function ClaimDetailPage({
  params,
}: ClaimDetailPageProps) {
  const { societyId: encodedSocietyId, claimId: rawClaimId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);
  const claimId = Number.parseInt(rawClaimId, 10);

  if (!societyId || !/^\d+$/.test(rawClaimId) || claimId <= 0) {
    notFound();
  }

  return <ClaimDetailClient claimId={claimId} societyId={societyId} />;
}
