import type { ReactNode } from "react";

import { DeveloperSidebar } from "@/components/layout/developer-sidebar";
import { RouteGuard } from "@/features/auth/components/route-guard";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Developer console",
  "Platform tools for managing societies, plans, and subscriptions.",
);

export default function DeveloperDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RouteGuard mode="developerOnly">
      <div className="flex h-dvh overflow-hidden bg-background">
        <DeveloperSidebar />
        <div className="h-dvh min-w-0 flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
