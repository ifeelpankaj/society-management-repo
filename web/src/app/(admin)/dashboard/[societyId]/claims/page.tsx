import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flat claims",
  "Review and resolve resident flat claim requests.",
);

const ClaimsClient = dynamic(
  () =>
    import("@/features/admin/claims").then((m) => ({
      default: m.ClaimsClient,
    })),
  { loading: () => <AppLoader label="Loading claims" /> },
);

type ClaimsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function ClaimsPage({ params }: ClaimsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <ClaimsClient encodedSocietyId={encodedSocietyId} societyId={societyId} />
  );
}
//TODO: we have to create a detail page for claim as well and in that page
//getV1SocietiesBySocietyIdFlatClaimsAndClaimId to get claim details
//getV1MeResidences use this and pass society and flat id which we got from getV1SocietiesBySocietyIdFlatClaimsAndClaimId to show all flat resident
// and that to in taable format when user click on it it can redirect to flat details page with same
//postV1FlatClaimsByClaimIdApprove to approve claim
//postV1FlatClaimsByClaimIdCancel to reject claim
