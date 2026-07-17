import { CreateSocietyOnboardingClient } from "@/features/admin/onboarding";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Create society",
  "Register a new society and start the onboarding flow.",
);

export default function OnboardingPage() {
  return <CreateSocietyOnboardingClient />;
}
