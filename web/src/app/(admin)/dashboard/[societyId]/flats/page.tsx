import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flats",
  "Manage flat inventory, occupancy, and availability.",
);

const FlatsClient = dynamic(
  () =>
    import("@/features/admin/flats").then((m) => ({ default: m.FlatsClient })),
  { loading: () => <AppLoader label="Loading flats" /> },
);

type FlatsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function FlatsPage({ params }: FlatsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return (
    <FlatsClient encodedSocietyId={encodedSocietyId} societyId={societyId} />
  );
}
