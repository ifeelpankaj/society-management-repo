import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Residents",
  "Manage society members and resident records.",
);

const ResidentsClient = dynamic(
  () =>
    import("@/features/admin/residents").then((m) => ({
      default: m.ResidentsClient,
    })),
  { loading: () => <AppLoader label="Loading residents" /> },
);

type ResidentsPageProps = {
  params: Promise<{ societyId: string }>;
};

export default async function ResidentsPage({ params }: ResidentsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <ResidentsClient
      encodedSocietyId={encodedSocietyId}
      societyId={societyId}
    />
  );
}
//Here only show one detail button in table action column
