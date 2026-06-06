"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ClaimStatusBadge } from "@/features/admin/claims/components/claim-status-badge";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="space-y-1 rounded-lg border border-border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="break-words font-medium text-sm">
        {typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : (value ?? "Not set")}
      </p>
    </div>
  );
}

type ClaimReviewDetailsProps = {
  actionInProgress: boolean;
  claim: ModelsFlatClaimResponse;
  onApprove: (claim: ModelsFlatClaimResponse) => void;
  onStartReject: (claim: ModelsFlatClaimResponse) => void;
  showActions?: boolean;
};

export function ClaimReviewDetails({
  actionInProgress,
  claim,
  onApprove,
  onStartReject,
  showActions = true,
}: ClaimReviewDetailsProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-sm">Review Status</h2>
          <ClaimStatusBadge status={claim.status} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            label="Created"
            value={formatShortDateIN(claim.created_at)}
          />
          <DetailRow
            label="Updated"
            value={formatShortDateIN(claim.updated_at)}
          />
          <DetailRow
            label="Reviewed"
            value={formatShortDateIN(claim.reviewed_at)}
          />
          <DetailRow
            label="Reviewed by"
            value={
              claim.reviewer_name ??
              claim.reviewer_email ??
              claim.reviewer_phone ??
              "Not set"
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Claimant</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Name" value={claim.user_name} />
          <DetailRow label="Email" value={claim.user_email} />
          <DetailRow label="Phone" value={claim.user_phone} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Flat</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Flat number" value={claim.flat_number} />
          <DetailRow
            label="Flat status"
            value={titleCaseFromSnake(claim.flat_status)}
          />
          <DetailRow label="Block" value={claim.block} />
          <DetailRow label="Floor" value={claim.floor} />
          <DetailRow label="Society" value={claim.society_name} />
          <DetailRow label="Society code" value={claim.society_code} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Request</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            label="Requested role"
            value={titleCaseFromSnake(claim.requested_role)}
          />
          <DetailRow label="Primary resident" value={claim.requested_primary} />
          <DetailRow
            label="Cancelled"
            value={formatShortDateIN(claim.cancelled_at)}
          />
          <DetailRow label="Rejection reason" value={claim.rejection_reason} />
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-foreground text-xs">Note</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {claim.note || "No note provided"}
          </p>
        </div>
      </section>

      {showActions && claim.status === "pending" ? (
        <DialogFooter className="mx-0 mb-0 rounded-lg">
          <Button
            disabled={actionInProgress || !claim.id}
            onClick={() => onStartReject(claim)}
            type="button"
            variant="destructive"
          >
            <XCircle className="size-4" />
            Reject
          </Button>
          <Button
            disabled={actionInProgress || !claim.id}
            onClick={() => onApprove(claim)}
            type="button"
          >
            <CheckCircle2 className="size-4" />
            Approve
          </Button>
        </DialogFooter>
      ) : null}
    </div>
  );
}
