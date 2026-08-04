import type { ReactNode } from "react";

import { ProfileWorkspaceShell } from "@/components/layout/profile-workspace-shell";
import { RouteGuard } from "@/features/auth/components/route-guard";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Profile",
  "View and manage your account profile.",
);

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard mode="authenticated">
      <ProfileWorkspaceShell>{children}</ProfileWorkspaceShell>
    </RouteGuard>
  );
}
