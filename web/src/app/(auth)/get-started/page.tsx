import { AuthPublicShell } from "@/features/auth/components/auth-public-shell";
import { GetStartedCard } from "@/features/auth/get-started/components/get-started-card";
import { GetStartedHero } from "@/features/auth/get-started/components/get-started-hero";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Get started",
  "Create your society workspace and begin onboarding.",
);

export default function GetStartedPage() {
  return (
    <AuthPublicShell hero={<GetStartedHero />}>
      <GetStartedCard />
    </AuthPublicShell>
  );
}
