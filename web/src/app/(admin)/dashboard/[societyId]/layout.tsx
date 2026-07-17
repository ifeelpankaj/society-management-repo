import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { RouteGuard } from "@/features/auth/components/route-guard";
import { decodeSocietyId } from "@/lib/routes/society-route";

export default async function SocietyDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;
  const decodedSocietyId = decodeSocietyId(societyId);

  if (!decodedSocietyId) {
    notFound();
  }

  return (
    <RouteGuard mode="adminWorkspace" societyId={decodedSocietyId}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar societyId={decodedSocietyId} />
        <div className="h-dvh min-w-0 flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
