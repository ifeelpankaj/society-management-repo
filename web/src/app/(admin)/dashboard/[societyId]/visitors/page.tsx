import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Visitors",
  "Track visitor entries and gate activity for this society.",
);

const VisitorsClient = dynamic(
  () =>
    import("@/features/admin/visitors").then((m) => ({
      default: m.VisitorsClient,
    })),
  { loading: () => <AppLoader label="Loading visitors" /> },
);

type VisitorsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function VisitorsPage({ params }: VisitorsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <VisitorsClient encodedSocietyId={encodedSocietyId} societyId={societyId} />
  );
}
