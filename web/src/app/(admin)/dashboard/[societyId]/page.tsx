import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Society dashboard",
  "Overview of society operations, metrics, and setup tasks.",
);

const SocietyDashboardClient = dynamic(
  () =>
    import("@/features/admin/dashboard").then((m) => ({
      default: m.SocietyDashboardClient,
    })),
  { loading: () => <AppLoader label="Loading dashboard" /> },
);

type SocietyDashboardPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function SocietyDashboardPage({
  params,
}: SocietyDashboardPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return <SocietyDashboardClient societyId={societyId} />;
}
