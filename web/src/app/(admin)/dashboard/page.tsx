import { RouteGuard } from "@/features/auth/components/route-guard";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Dashboard",
  "Open your society admin workspace.",
);

export default function DashboardIndexPage() {
  return <RouteGuard mode="resolveAuthenticated" />;
}
