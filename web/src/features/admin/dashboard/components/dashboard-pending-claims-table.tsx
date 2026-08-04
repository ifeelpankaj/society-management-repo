"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SmartTable } from "@/components/tables/smart-table";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { ClaimStatusBadge } from "@/features/admin/claims/components/claim-status-badge";
import {
  claimLabel,
  flatLabel,
} from "@/features/admin/claims/components/claims-table-columns";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type DashboardPendingClaimsTableProps = {
  claims: ModelsFlatClaimResponse[];
  societyId: number;
};

export function DashboardPendingClaimsTable({
  claims,
  societyId,
}: DashboardPendingClaimsTableProps) {
  const columns = useMemo<SmartTableColumn<ModelsFlatClaimResponse>[]>(
    () => [
      {
        id: "claimant",
        header: "Claimant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{claimLabel(row.original)}</p>
            <p className="truncate text-muted-foreground text-xs">
              {row.original.user_email ?? "Email not set"}
            </p>
          </div>
        ),
      },
      {
        id: "flat",
        header: "Flat",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-sm">{flatLabel(row.original)}</p>
            <p className="text-muted-foreground text-xs">
              {titleCaseFromSnake(row.original.requested_role)}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <ClaimStatusBadge status={row.original.status} />,
      },
      {
        id: "submitted",
        header: "Submitted",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatShortDateIN(row.original.created_at, "Not set")}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base">Pending claims</h3>
          <p className="text-muted-foreground text-sm">
            Resident requests awaiting your review
          </p>
        </div>
        <Link
          className="font-medium text-primary text-sm hover:underline"
          href={paths.claims(societyId)}
        >
          View all
        </Link>
      </div>
      {claims.length > 0 ? (
        <SmartTable
          columns={columns}
          data={claims}
          rowKey={(claim) => claim.id ?? "claim"}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-muted-foreground text-sm">
          No pending claims right now.
        </div>
      )}
    </section>
  );
}
