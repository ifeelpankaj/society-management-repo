import dynamic from "next/dynamic";

import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";

import { decodeSocietyId } from "@/lib/routes/society-route";

import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flat details",

  "View and manage a flat record.",
);

const FlatDetailClient = dynamic(
  () =>
    import("@/features/admin/flats").then((m) => ({
      default: m.FlatDetailClient,
    })),

  { loading: () => <AppLoader label="Loading flat" /> },
);

type FlatDetailPageProps = {
  params: Promise<{
    societyId: string;

    flatId: string;
  }>;
};

export default async function FlatDetailPage({ params }: FlatDetailPageProps) {
  const { societyId: encodedSocietyId, flatId: rawFlatId } = await params;

  const societyId = decodeSocietyId(encodedSocietyId);

  const flatId = Number.parseInt(rawFlatId, 10);

  if (!societyId || !/^\d+$/.test(rawFlatId) || flatId <= 0) {
    notFound();
  }

  return (
    <FlatDetailClient
      encodedSocietyId={encodedSocietyId}
      flatId={flatId}
      societyId={societyId}
    />
  );
}
