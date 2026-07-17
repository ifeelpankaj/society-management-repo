import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { paths } from "@/lib/routes/paths";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flat resident details",
  "Platform view of a flat resident.",
);

const FlatResidentDetail = dynamic(
  () =>
    import("@/features/flats").then((m) => ({
      default: m.FlatResidentDetail,
    })),
  { loading: () => <AppLoader label="Loading resident" /> },
);

type DeveloperFlatResidentPageProps = {
  params: Promise<{
    societyId: string;
    flatId: string;
    residentId: string;
  }>;
};

export default async function DeveloperFlatResidentPage({
  params,
}: DeveloperFlatResidentPageProps) {
  const {
    societyId: rawSocietyId,
    flatId: rawFlatId,
    residentId: rawResidentId,
  } = await params;

  const societyId = Number.parseInt(rawSocietyId, 10);
  const flatId = Number.parseInt(rawFlatId, 10);
  const residentId = Number.parseInt(rawResidentId, 10);

  if (
    !/^\d+$/.test(rawSocietyId) ||
    societyId <= 0 ||
    !/^\d+$/.test(rawFlatId) ||
    flatId <= 0 ||
    !/^\d+$/.test(rawResidentId) ||
    residentId <= 0
  ) {
    notFound();
  }

  return (
    <FlatResidentDetail
      backHref={paths.developerFlatDetail(societyId, flatId)}
      backLabel="Flat details"
      flatDetailHref={paths.developerFlatDetail(societyId, flatId)}
      flatId={flatId}
      readOnly
      residentId={residentId}
      societyId={societyId}
    />
  );
}
