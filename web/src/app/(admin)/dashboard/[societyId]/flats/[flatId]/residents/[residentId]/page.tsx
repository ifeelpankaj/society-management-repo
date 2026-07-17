import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flat resident details",
  "View and manage a flat resident record.",
);

const FlatResidentDetail = dynamic(
  () =>
    import("@/features/flats").then((m) => ({
      default: m.FlatResidentDetail,
    })),
  { loading: () => <AppLoader label="Loading resident" /> },
);

type FlatResidentDetailPageProps = {
  params: Promise<{
    societyId: string;
    flatId: string;
    residentId: string;
  }>;
};

export default async function FlatResidentDetailPage({
  params,
}: FlatResidentDetailPageProps) {
  const {
    societyId: encodedSocietyId,
    flatId: rawFlatId,
    residentId: rawResidentId,
  } = await params;

  const societyId = decodeSocietyId(encodedSocietyId);
  const flatId = Number.parseInt(rawFlatId, 10);
  const residentId = Number.parseInt(rawResidentId, 10);

  if (
    !societyId ||
    !/^\d+$/.test(rawFlatId) ||
    flatId <= 0 ||
    !/^\d+$/.test(rawResidentId) ||
    residentId <= 0
  ) {
    notFound();
  }

  return (
    <FlatResidentDetail
      backHref={`/dashboard/${encodedSocietyId}/flats/${flatId}`}
      backLabel="Flat details"
      flatId={flatId}
      residentId={residentId}
      societyId={societyId}
    />
  );
}
