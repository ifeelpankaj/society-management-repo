"use client";

import {
  Building2,
  CheckCircle2,
  LogOut,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitorEventTimeline } from "@/features/admin/visitors/components/visitor-event-timeline";
import { VisitorRejectDialog } from "@/features/admin/visitors/components/visitor-reject-dialog";
import { VisitorSourceBadge } from "@/features/admin/visitors/components/visitor-source-badge";
import { VisitorStatusBadge } from "@/features/admin/visitors/components/visitor-status-badge";
import {
  visitorFlatLabel,
  visitorLabel,
} from "@/features/admin/visitors/components/visitors-table-columns";
import { useVisitorDetail } from "@/features/admin/visitors/hooks/use-visitor-detail";
import { useAdminSocietySession } from "@/features/admin/society/hooks/use-admin-society";
import {
  ActionPanel,
  ConfirmReasonDialog,
  DetailPageLayout,
  StatusHero,
} from "@/features/shared/detail-page";
import { isAdminSetupRole } from "@/features/auth/auth-routing";
import { VISITOR_PURPOSE_LABELS } from "@/lib/constants/visitor-purpose";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type VisitorDetailClientProps = {
  societyId: number;
  entryId: number;
  backHref?: string;
  backLabel?: string;
  flatDetailHref?: (flatId: number) => string;
};

export function VisitorDetailClient({
  societyId,
  entryId,
  backHref,
  backLabel = "Visitors",
  flatDetailHref,
}: VisitorDetailClientProps) {
  const visitorsHref = paths.visitors(societyId);
  const resolveFlatHref =
    flatDetailHref ?? ((flatId: number) => paths.flatDetail(societyId, flatId));

  const { selectedMembershipRole } = useAdminSocietySession({
    selectedSocietyId: societyId,
  });
  const canDecide = isAdminSetupRole(selectedMembershipRole);

  const {
    approveOpen,
    busy,
    canCheckOut,
    checkOutOpen,
    entry,
    entryQuery,
    events,
    eventsQuery,
    handleApprove,
    handleCheckOut,
    handleReject,
    isPending,
    isRejecting,
    refetch,
    rejectOpen,
    rejectReason,
    setApproveOpen,
    setCheckOutOpen,
    setRejectOpen,
    setRejectReason,
  } = useVisitorDetail({ societyId, entryId });

  const purposeLabel =
    entry?.purpose && entry.purpose in VISITOR_PURPOSE_LABELS
      ? VISITOR_PURPOSE_LABELS[
          entry.purpose as keyof typeof VISITOR_PURPOSE_LABELS
        ]
      : titleCaseFromSnake(entry?.purpose);

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton loading={entryQuery.isFetching} onClick={refetch} />
        }
        description="Review visitor details, inspect flat context, and resolve access."
        eyebrow={<BackLink href={backHref ?? visitorsHref} label={backLabel} />}
        title={
          entry ? (
            <span className="flex flex-wrap items-center gap-3">
              {visitorLabel(entry)}
              <VisitorStatusBadge status={entry.status} />
            </span>
          ) : (
            "Visitor entry"
          )
        }
      />

      <AsyncPanel
        error={
          entryQuery.isError ? "Refresh the visitor entry and try again." : null
        }
        loading={entryQuery.isLoading}
        loadingLabel="Loading visitor entry"
        onRetry={refetch}
      >
        {entry ? (
          <DetailPageLayout
            actions={
              canDecide && isPending ? (
                <ActionPanel
                  description="Approve to allow entry, or reject with a clear reason."
                  title="Decision"
                >
                  <Button
                    disabled={busy}
                    onClick={() => setApproveOpen(true)}
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Approve visitor
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => setRejectOpen(true)}
                    type="button"
                    variant="destructive"
                  >
                    <XCircle className="size-4" />
                    Reject visitor
                  </Button>
                </ActionPanel>
              ) : canDecide && canCheckOut ? (
                <ActionPanel
                  description="Mark this visitor as checked out when they leave the premises."
                  title="Checkout"
                >
                  <Button
                    disabled={busy}
                    onClick={() => setCheckOutOpen(true)}
                    type="button"
                  >
                    <LogOut className="size-4" />
                    Check out visitor
                  </Button>
                </ActionPanel>
              ) : (
                <SectionCard
                  description="This visitor entry has been resolved."
                  title="Status recorded"
                >
                  <p className="text-muted-foreground text-sm">
                    Status: {titleCaseFromSnake(entry.status)}
                    {entry.rejection_reason
                      ? ` — ${entry.rejection_reason}`
                      : null}
                  </p>
                </SectionCard>
              )
            }
            summary={
              <StatusHero
                description={`${purposeLabel} visit to ${visitorFlatLabel(entry)}`}
                icon={<UserRound className="size-5" />}
                status={entry.status}
                title={visitorLabel(entry)}
              />
            }
            sidebar={
              <SectionCard
                description="Destination flat for this visit"
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
                    <span className="font-medium">{visitorFlatLabel(entry)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Block / floor: </span>
                    {[entry.flat?.block, entry.flat?.floor]
                      .filter(Boolean)
                      .join(" / ") || "Not set"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Created: </span>
                    {formatShortDateIN(entry.created_at)}
                  </p>
                  {entry.flat_id ? (
                    <Button asChild type="button" variant="outline">
                      <Link href={resolveFlatHref(entry.flat_id)}>
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
                  description="Visitor contact, visit metadata, and timing"
                  title="Entry details"
                >
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Phone
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {entry.visitor?.phone_number ?? "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Email
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {entry.visitor?.email ?? "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Purpose
                      </dt>
                      <dd className="mt-1">
                        <Badge variant="secondary">{purposeLabel}</Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Source
                      </dt>
                      <dd className="mt-1">
                        <VisitorSourceBadge source={entry.source} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Companions
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {entry.companions_count ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Vehicle
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {entry.vehicle_number
                          ? `${entry.vehicle_number}${entry.vehicle_type ? ` (${titleCaseFromSnake(entry.vehicle_type)})` : ""}`
                          : "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Expected at
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {formatShortDateIN(entry.expected_at)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Checked in
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {formatShortDateIN(entry.checked_in_at)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                        Checked out
                      </dt>
                      <dd className="mt-1 font-medium text-sm">
                        {formatShortDateIN(entry.checked_out_at)}
                      </dd>
                    </div>
                    {entry.notes ? (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                          Notes
                        </dt>
                        <dd className="mt-1 text-sm">{entry.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </SectionCard>

                <VisitorEventTimeline
                  events={events}
                  loading={eventsQuery.isLoading}
                />
              </>
            }
          />
        ) : null}
      </AsyncPanel>

      {canDecide ? (
        <>
          <ConfirmReasonDialog
            busy={busy}
            confirmLabel="Approve"
            description="The visitor will be allowed to proceed with this entry."
            onConfirm={handleApprove}
            onOpenChange={setApproveOpen}
            onReasonChange={() => {}}
            open={approveOpen}
            reason=""
            title={`Approve visitor for ${entry ? visitorFlatLabel(entry) : "this flat"}?`}
          />

          <VisitorRejectDialog
            isRejecting={isRejecting}
            onOpenChange={setRejectOpen}
            onReject={handleReject}
            onRejectReasonChange={setRejectReason}
            open={rejectOpen}
            rejectReason={rejectReason}
            rejectingEntry={entry ?? null}
          />

          <ConfirmReasonDialog
            busy={busy}
            confirmLabel="Check out"
            description="This will mark the visitor as checked out from the premises."
            onConfirm={handleCheckOut}
            onOpenChange={setCheckOutOpen}
            onReasonChange={() => {}}
            open={checkOutOpen}
            reason=""
            title={`Check out ${entry ? visitorLabel(entry) : "this visitor"}?`}
          />
        </>
      ) : null}
    </WorkspacePage>
  );
}
