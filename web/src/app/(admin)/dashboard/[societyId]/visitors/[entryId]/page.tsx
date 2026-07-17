import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Visitor entry",
  "Review visitor entry details and activity.",
);

const VisitorDetailClient = dynamic(
  () =>
    import("@/features/admin/visitors").then((m) => ({
      default: m.VisitorDetailClient,
    })),
  { loading: () => <AppLoader label="Loading visitor entry" /> },
);

type VisitorDetailPageProps = {
  params: Promise<{
    societyId: string;
    entryId: string;
  }>;
};

export default async function VisitorDetailPage({
  params,
}: VisitorDetailPageProps) {
  const { societyId: encodedSocietyId, entryId: rawEntryId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);
  const entryId = Number.parseInt(rawEntryId, 10);

  if (!societyId || !/^\d+$/.test(rawEntryId) || entryId <= 0) {
    notFound();
  }

  return <VisitorDetailClient entryId={entryId} societyId={societyId} />;
}
