import { SubscriptionsClient } from "@/features/developer/subscriptions";

import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Subscriptions",

  "Track society subscriptions, trials, and renewals.",
);

export default function DeveloperSubscriptionsPage() {
  return <SubscriptionsClient />;
}
