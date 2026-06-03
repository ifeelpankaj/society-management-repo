import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useMemo } from "react";

import type { SmartTableColumn } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimStatusBadge } from "@/features/admin/claims/components/claim-status-badge";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";

export function claimLabel(claim?: ModelsFlatClaimResponse | null) {
  if (!claim) return "Claim";
  return claim.user_name || claim.user_email || `User #${claim.user_id}`;
}

export function flatLabel(claim?: ModelsFlatClaimResponse | null) {
  if (!claim) return "Flat";
  return claim.flat_number || `Flat #${claim.flat_id}`;
}

type UseClaimsTableColumnsOptions = {
  actionInProgress: boolean;
  onApprove: (claim: ModelsFlatClaimResponse) => void;
  onReject: (claim: ModelsFlatClaimResponse) => void;
  onView: (claimId: number | null) => void;
};

export function useClaimsTableColumns({
  actionInProgress,
  onApprove,
  onReject,
  onView,
}: UseClaimsTableColumnsOptions) {
  return useMemo<SmartTableColumn<ModelsFlatClaimResponse>[]>(
    () => [
      {
        id: "claimant",
        header: "Claimant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{claimLabel(row.original)}</p>
            <p className="truncate text-muted-foreground text-xs">
              {row.original.user_phone ||
                row.original.user_email ||
                "Contact not set"}
            </p>
          </div>
        ),
      },
      {
        id: "flat",
        header: "Flat",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium">{flatLabel(row.original)}</p>
            <p className="text-muted-foreground text-xs">
              {[row.original.block, row.original.floor]
                .filter(Boolean)
                .join(" - ") || "Block/floor not set"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "requested_role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {titleCaseFromSnake(row.original.requested_role)}
          </Badge>
        ),
      },
      {
        accessorKey: "requested_primary",
        header: "Primary",
        cell: ({ row }) => (row.original.requested_primary ? "Yes" : "No"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ClaimStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatShortDateIN(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => {
          const claim = row.original;
          const isPending = claim.status === "pending";

          return (
            <div className="flex justify-end gap-1.5">
              <Button
                aria-label={`View ${claimLabel(claim)}`}
                disabled={!claim.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onView(claim.id ?? null);
                }}
                size="icon-sm"
                title="View claim"
                type="button"
                variant="ghost"
              >
                <Eye className="size-4" />
              </Button>
              {isPending ? (
                <>
                  <Button
                    aria-label={`Approve ${claimLabel(claim)}`}
                    disabled={!claim.id || actionInProgress}
                    onClick={(event) => {
                      event.stopPropagation();
                      onApprove(claim);
                    }}
                    size="icon-sm"
                    title="Approve claim"
                    type="button"
                    variant="outline"
                  >
                    <CheckCircle2 className="size-4" />
                  </Button>
                  <Button
                    aria-label={`Reject ${claimLabel(claim)}`}
                    disabled={!claim.id || actionInProgress}
                    onClick={(event) => {
                      event.stopPropagation();
                      onReject(claim);
                    }}
                    size="icon-sm"
                    title="Reject claim"
                    type="button"
                    variant="destructive"
                  >
                    <XCircle className="size-4" />
                  </Button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [actionInProgress, onApprove, onReject, onView],
  );
}
