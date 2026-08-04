import { RouteGuard } from "@/features/auth/components/route-guard";
import { DownloadAppClient } from "@/features/auth/download-app";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Download the app",
  "Download the Gatezy mobile app for residents and guards.",
);

export default function DownloadAppPage() {
  return (
    <RouteGuard mode="mobileOnly">
      <DownloadAppClient />
    </RouteGuard>
  );
}
