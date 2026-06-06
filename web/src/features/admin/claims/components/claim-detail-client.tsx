"use client";

import { Building2, CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { SmartTable } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimRejectDialog } from "@/features/admin/claims/components/claim-reject-dialog";
import { ClaimReviewDetails } from "@/features/admin/claims/components/claim-review-details";
import { ClaimStatusBadge } from "@/features/admin/claims/components/claim-status-badge";
import {
  claimLabel,
  flatLabel,
} from "@/features/admin/claims/components/claims-table-columns";
import { useClaimDetail } from "@/features/admin/claims/hooks/use-claim-detail";
import {
  ActionPanel,
  ConfirmReasonDialog,
  DetailPageLayout,
  StatusHero,
} from "@/features/shared/detail-page";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type ClaimDetailClientProps = {
  societyId: number;
  claimId: number;
  backHref?: string;
  backLabel?: string;
  claimsHref?: string;
  flatDetailHref?: (flatId: number) => string;
  flatResidentDetailHref?: (flatId: number, residentId: number) => string;
  readOnly?: boolean;
};

function residentDisplayName(resident: ModelsFlatResidentResponse) {
  return (
    resident.user_name || resident.user_email || `User #${resident.user_id}`
  );
}

export function ClaimDetailClient({
  societyId,
  claimId,
  backHref,
  backLabel = "Flat claims",
  claimsHref: claimsHrefProp,
  flatDetailHref,
  flatResidentDetailHref,
  readOnly = false,
}: ClaimDetailClientProps) {
  const router = useRouter();
  const claimsHref = claimsHrefProp ?? paths.claims(societyId);
  const resolveFlatHref =
    flatDetailHref ?? ((flatId: number) => paths.flatDetail(societyId, flatId));
  const resolveFlatResidentHref =
    flatResidentDetailHref ??
    ((flatId: number, residentId: number) =>
      paths.flatResidentDetail(societyId, flatId, residentId));
  const {
    approveOpen,
    busy,
    claim,
    claimQuery,
    handleApprove,
    handleReject,
    isPending,
    isRejecting,
    rejectOpen,
    rejectReason,
    refetch,
    residents,
    residentsQuery,
    setApproveOpen,
    setRejectOpen,
    setRejectReason,
  } = useClaimDetail({ societyId, claimId });

  const residentColumns = useMemo<
    SmartTableColumn<ModelsFlatResidentResponse>[]
  >(
    () => [
      {
        id: "name",
        header: "Resident",
        cell: ({ row }) => (
          <p className="font-medium">{residentDisplayName(row.original)}</p>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {titleCaseFromSnake(row.original.role)}
          </Badge>
        ),
      },
      {
        id: "primary",
        header: "Primary",
        cell: ({ row }) => (row.original.is_primary ? "Yes" : "No"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline">
            {titleCaseFromSnake(row.original.status)}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton loading={claimQuery.isFetching} onClick={refetch} />
        }
        description="Review the request, inspect current flat residents, and resolve access."
        eyebrow={<BackLink href={backHref ?? claimsHref} label={backLabel} />}
        title={
          claim ? (
            <span className="flex flex-wrap items-center gap-3">
              {claimLabel(claim)}
              <ClaimStatusBadge status={claim.status} />
            </span>
          ) : (
            "Claim review"
          )
        }
      />

      <AsyncPanel
        error={claimQuery.isError ? "Refresh the claim and try again." : null}
        loading={claimQuery.isLoading}
        loadingLabel="Loading claim"
        onRetry={refetch}
      >
        {claim ? (
          <DetailPageLayout
            actions={
              readOnly ? null : isPending ? (
                <ActionPanel
                  description="Approve to grant flat access, or reject with a clear reason for the resident."
                  title="Decision"
                >
                  <Button
                    disabled={busy}
                    onClick={() => setApproveOpen(true)}
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Approve claim
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => setRejectOpen(true)}
                    type="button"
                    variant="destructive"
                  >
                    <XCircle className="size-4" />
                    Reject claim
                  </Button>
                </ActionPanel>
              ) : (
                <SectionCard
                  description="This claim has already been resolved."
                  title="Decision recorded"
                >
                  <p className="text-muted-foreground text-sm">
                    Status: {titleCaseFromSnake(claim.status)}
                    {claim.rejection_reason
                      ? ` — ${claim.rejection_reason}`
                      : null}
                  </p>
                </SectionCard>
              )
            }
            summary={
              <StatusHero
                description={`Requested ${titleCaseFromSnake(claim.requested_role)} role on ${flatLabel(claim)}`}
                icon={<ClipboardList className="size-5" />}
                status={claim.status}
                title={claimLabel(claim)}
              />
            }
            sidebar={
              <SectionCard
                description="Target flat for this claim"
                title={
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Flat context
                  </span>
                }
              >
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Flat: </span>
                    <span className="font-medium">{flatLabel(claim)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Block / floor:{" "}
                    </span>
                    {[claim.block, claim.floor].filter(Boolean).join(" / ") ||
                      "Not set"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Submitted: </span>
                    {formatShortDateIN(claim.created_at)}
                  </p>
                  {claim.flat_id ? (
                    <Button asChild type="button" variant="outline">
                      <Link href={resolveFlatHref(claim.flat_id)}>
                        Open flat details
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </SectionCard>
            }
            main={
              <>
                <SectionCard
                  description="Full claim payload and claimant contact"
                  title="Claim details"
                >
                  <ClaimReviewDetails
                    actionInProgress={busy}
                    claim={claim}
                    onApprove={() => setApproveOpen(true)}
                    onStartReject={() => setRejectOpen(true)}
                    showActions={false}
                  />
                </SectionCard>

                <SectionCard
                  description="People currently linked to this flat"
                  title="Current flat residents"
                >
                  {residentsQuery.isLoading ? (
                    <p className="text-muted-foreground text-sm">
                      Loading residents...
                    </p>
                  ) : residents.length > 0 ? (
                    <SmartTable
                      columns={residentColumns}
                      data={residents}
                      onRowClick={(resident) => {
                        if (claim.flat_id && resident.id) {
                          router.push(
                            resolveFlatResidentHref(claim.flat_id, resident.id),
                          );
                        }
                      }}
                      rowKey={(row) =>
                        row.id ?? row.user_id ?? residentDisplayName(row)
                      }
                    />
                  ) : (
                    <EmptyState
                      description="No residents are assigned to this flat yet."
                      title="No residents on this flat"
                    />
                  )}
                </SectionCard>
              </>
            }
          />
        ) : null}
      </AsyncPanel>

      {!readOnly ? (
        <>
          <ConfirmReasonDialog
            busy={busy}
            confirmLabel="Approve"
            description="The resident will be added to the flat with the requested role."
            onConfirm={handleApprove}
            onOpenChange={setApproveOpen}
            onReasonChange={() => {}}
            open={approveOpen}
            reason=""
            title={`Approve claim for ${claim ? flatLabel(claim) : "this flat"}?`}
          />

          <ClaimRejectDialog
            isRejecting={isRejecting}
            onOpenChange={setRejectOpen}
            onReject={handleReject}
            onRejectReasonChange={setRejectReason}
            open={rejectOpen}
            rejectReason={rejectReason}
            rejectingClaim={claim ?? null}
          />
        </>
      ) : null}
    </WorkspacePage>
  );
}
