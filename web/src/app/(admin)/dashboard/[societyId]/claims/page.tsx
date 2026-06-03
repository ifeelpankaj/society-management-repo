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
