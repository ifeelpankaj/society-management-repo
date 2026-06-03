import { PlansClient } from "@/features/developer/plans";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Plans",
  "Create and manage subscription plans.",
);

export default function DeveloperPlansPage() {
  return <PlansClient />;
}
