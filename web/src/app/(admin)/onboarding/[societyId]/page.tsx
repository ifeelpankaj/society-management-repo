import { notFound } from "next/navigation";

import { SocietyOnboardingClient } from "@/features/admin/onboarding";
import { decodeSocietyId } from "@/lib/routes/society-route";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Society onboarding",
  "Complete setup tasks for your society workspace.",
);

type SocietyOnboardingPageProps = {
  params: Promise<{
    societyId: string;
  }>;
};

export default async function SocietyOnboardingPage({
  params,
}: SocietyOnboardingPageProps) {
  const { societyId: encodedSocietyId } = await params;
  const societyId = decodeSocietyId(encodedSocietyId);

  if (!societyId) {
    notFound();
  }

  return <SocietyOnboardingClient societyId={societyId} />;
}
