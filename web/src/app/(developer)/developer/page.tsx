import dynamic from "next/dynamic";

import { AppLoader } from "@/components/shared/app-loader";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Overview",
  "Platform metrics and pending society approvals.",
);

const DeveloperDashboardClient = dynamic(
  () =>
    import("@/features/developer/dashboard").then((m) => ({
      default: m.DeveloperDashboardClient,
    })),
  { loading: () => <AppLoader label="Loading developer dashboard" /> },
);

export default function DeveloperDashboardPage() {
  return <DeveloperDashboardClient />;
}
