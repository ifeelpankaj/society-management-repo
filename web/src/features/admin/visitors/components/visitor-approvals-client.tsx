"use client";

import { type ComponentProps, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { FilterPanel } from "@/components/data/filter-panel";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { SmartTable } from "@/components/tables/smart-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VisitorRejectDialog } from "@/features/admin/visitors/components/visitor-reject-dialog";
import { useVisitorApprovalsTableColumns } from "@/features/admin/visitors/components/visitors-table-columns";
import {
  useVisitorApprovals,
  useVisitorMutations,
} from "@/features/admin/visitors/hooks";
import { useAdminSocietySession } from "@/features/admin/society/hooks/use-admin-society";
import { isAdminSetupRole } from "@/features/auth/auth-routing";
import type { VisitorPendingEntry } from "@/lib/api/visitor-types";
import { formatNumberIN } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type VisitorApprovalsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function VisitorApprovalsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: VisitorApprovalsClientProps) {
  const router = useRouter();
  const { selectedMembershipRole } = useAdminSocietySession({
    selectedSocietyId: societyId,
  });
  const canDecide = isAdminSetupRole(selectedMembershipRole);

  const {
    block,
    entries,
    isEmpty,
    isError,
    isFetching,
    isLoading,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    setBlock,
    setPage,
    setPageSize,
    total,
    totalPages,
  } = useVisitorApprovals({ societyId });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingEntry, setRejectingEntry] =
    useState<VisitorPendingEntry | null>(null);

  const mutations = useVisitorMutations({
    societyId,
    onSuccess: () => {
      refetch();
      setRejectOpen(false);
      setRejectReason("");
      setRejectingEntry(null);
    },
  });

  const openEntry = useCallback(
    (entryId: number | null) => {
      if (!entryId) return;
      router.push(paths.visitorDetail(societyId, entryId));
    },
    [router, societyId],
  );

  const handleApprove = useCallback(
    (entry: VisitorPendingEntry) => {
      if (!entry.id) return;
      mutations.handleApprove(entry.id);
    },
    [mutations],
  );

  const handleStartReject = useCallback((entry: VisitorPendingEntry) => {
    setRejectingEntry(entry);
    setRejectReason("");
    setRejectOpen(true);
  }, []);

  const handleReject = useCallback(
    async (
      event: Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0],
    ) => {
      event.preventDefault();
      if (!rejectingEntry?.id) return;
      await mutations.handleReject(rejectingEntry.id, rejectReason, event);
    },
    [mutations, rejectReason, rejectingEntry],
  );

  const columns = useVisitorApprovalsTableColumns({
    busy: mutations.busy,
    canDecide,
    onApprove: handleApprove,
    onReject: handleStartReject,
    onView: openEntry,
  });

  return (
    <WorkspacePage>
      <PageHeader
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
        description="Review visitor requests awaiting resident or admin approval."
        eyebrow={
          <BackLink href={paths.visitors(societyId)} label="Visitors" />
        }
        title="Pending approvals"
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Approval queue</CardTitle>
              <CardDescription>
                {total > 0
                  ? `Showing ${formatNumberIN(pageStart)}-${formatNumberIN(pageEnd)} of ${formatNumberIN(total)} pending entries`
                  : "0 pending entries"}
              </CardDescription>
            </div>
            <FilterPanel defaultOpen>
              <Input
                aria-label="Filter by block"
                onChange={(event) => setBlock(event.target.value)}
                placeholder="Block"
                value={block}
              />
            </FilterPanel>
          </div>
        </CardHeader>
        <CardContent>
          <AsyncPanel
            empty={isEmpty}
            emptyDescription="New visitor requests will appear here when approval is required."
            emptyTitle="No pending approvals"
            error={
              isError ? "Refresh the approval queue and try again." : null
            }
            loading={isLoading}
            loadingLabel="Loading pending approvals"
            onRetry={refetch}
          >
            <div className="space-y-4">
              <SmartTable
                columns={columns}
                data={entries}
                loading={isFetching}
                onRowClick={(entry) => openEntry(entry.id ?? null)}
                rowKey={(row) => row.id ?? `${row.created_at}-${row.visitor_id}`}
              />
              <PaginationFooter
                loading={isFetching}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                page={page}
                pageSize={pageSize}
                totalItems={total}
                totalPages={totalPages}
              />
            </div>
          </AsyncPanel>
        </CardContent>
      </Card>

      {canDecide ? (
        <VisitorRejectDialog
          isRejecting={mutations.isRejecting}
          onOpenChange={setRejectOpen}
          onReject={handleReject}
          onRejectReasonChange={setRejectReason}
          open={rejectOpen}
          rejectReason={rejectReason}
          rejectingEntry={rejectingEntry}
        />
      ) : null}
    </WorkspacePage>
  );
}
