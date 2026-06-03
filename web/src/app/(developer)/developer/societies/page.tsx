import dynamic from "next/dynamic";

import { AppLoader } from "@/components/shared/app-loader";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Societies",
  "Review and manage registered societies.",
);

const SocietiesClient = dynamic(
  () =>
    import("@/features/developer/societies").then((m) => ({
      default: m.SocietiesClient,
    })),
  { loading: () => <AppLoader label="Loading societies" /> },
);

export default function DeveloperSocietiesPage() {
  return <SocietiesClient />;
}
