import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { paths } from "@/lib/routes/paths";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Claim details",
  "Platform view of a flat claim.",
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

type DeveloperClaimPageProps = {
  params: Promise<{ societyId: string; claimId: string }>;
};

export default async function DeveloperClaimPage({
  params,
}: DeveloperClaimPageProps) {
  const { societyId: rawSocietyId, claimId: rawClaimId } = await params;
  const societyId = Number.parseInt(rawSocietyId, 10);
  const claimId = Number.parseInt(rawClaimId, 10);

  if (
    !/^\d+$/.test(rawSocietyId) ||
    societyId <= 0 ||
    !/^\d+$/.test(rawClaimId) ||
    claimId <= 0
  ) {
    notFound();
  }

  return (
    <ClaimDetailClient
      backHref={paths.developerResidences()}
      backLabel="Residences"
      claimId={claimId}
      flatDetailHref={(flatId) => paths.developerFlatDetail(societyId, flatId)}
      flatResidentDetailHref={(flatId, residentId) =>
        paths.developerFlatResidentDetail(societyId, flatId, residentId)
      }
      readOnly
      societyId={societyId}
    />
  );
}
