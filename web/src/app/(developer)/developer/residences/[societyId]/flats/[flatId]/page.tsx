import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { paths } from "@/lib/routes/paths";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Flat details",
  "Platform view of a society flat.",
);

const FlatDetailClient = dynamic(
  () =>
    import("@/features/admin/flats").then((m) => ({
      default: m.FlatDetailClient,
    })),
  { loading: () => <AppLoader label="Loading flat" /> },
);

type DeveloperFlatPageProps = {
  params: Promise<{ societyId: string; flatId: string }>;
};

export default async function DeveloperFlatPage({
  params,
}: DeveloperFlatPageProps) {
  const { societyId: rawSocietyId, flatId: rawFlatId } = await params;
  const societyId = Number.parseInt(rawSocietyId, 10);
  const flatId = Number.parseInt(rawFlatId, 10);

  if (
    !/^\d+$/.test(rawSocietyId) ||
    societyId <= 0 ||
    !/^\d+$/.test(rawFlatId) ||
    flatId <= 0
  ) {
    notFound();
  }

  return (
    <FlatDetailClient
      encodedSocietyId={String(societyId)}
      flatId={flatId}
      backLabel="Residences"
      flatsHref={paths.developerResidences()}
      readOnly
      residentDetailHrefBase={`${paths.developerFlatDetail(societyId, flatId)}/residents`}
      societyId={societyId}
    />
  );
}
