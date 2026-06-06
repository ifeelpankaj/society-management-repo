import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

import { AppLoader } from "@/components/shared/app-loader";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Visitor settings",
  "Configure society-wide visitor approval rules and flat overrides.",
);

const VisitorSettingsClient = dynamic(
  () =>
    import(
      "@/features/admin/settings/components/visitor-settings-client"
    ).then((m) => ({
      default: m.VisitorSettingsClient,
    })),
  { loading: () => <AppLoader label="Loading visitor settings" /> },
);

type VisitorSettingsPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function VisitorSettingsPage({
  params,
}: VisitorSettingsPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return <VisitorSettingsClient societyId={societyId} />;
}
