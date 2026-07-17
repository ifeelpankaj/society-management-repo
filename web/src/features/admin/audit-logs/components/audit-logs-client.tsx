"use client";

import { ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { WorkspacePage } from "@/components/shared/workspace-page";

export function AuditLogsClient() {
  return (
    <WorkspacePage>
      <PageHeader
        description="Track important society actions for support and compliance review."
        title="Audit logs"
      />

      <EmptyState
        description="Audit logging is being prepared. Resident suspensions, flat changes, visitor decisions, and claim resolutions will appear here."
        icon={<ShieldCheck className="size-5" />}
        title="Coming soon"
      />
    </WorkspacePage>
  );
}
