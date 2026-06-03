import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Resident details",
  "View and manage a society member record.",
);

const ResidentDetailClient = dynamic(
  () =>
    import("@/features/admin/residents").then((m) => ({
      default: m.ResidentDetailClient,
    })),
  { loading: () => <AppLoader label="Loading resident" /> },
);

type ResidentDetailPageProps = {
  params: Promise<{ societyId: string; memberId: string }>;
};

export default async function ResidentDetailPage({
  params,
}: ResidentDetailPageProps) {
  const { societyId: encodedSocietyId, memberId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);
  const decodedMemberId = Number.parseInt(memberId, 10);

  if (
    !societyId ||
    !Number.isSafeInteger(decodedMemberId) ||
    decodedMemberId <= 0
  ) {
    notFound();
  }

  return (
    <ResidentDetailClient
      encodedSocietyId={encodedSocietyId}
      memberId={decodedMemberId}
      societyId={societyId}
    />
  );
}
