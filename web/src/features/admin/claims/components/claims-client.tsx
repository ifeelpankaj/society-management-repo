"use client";

import dynamic from "next/dynamic";

import { ListToolbar } from "@/components/data/list-toolbar";
import { FilterSelect } from "@/components/forms/filter-select";
import { AsyncPanel } from "@/components/shared/async-panel";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClaimsTable } from "@/features/admin/claims/components/claims-table";
import { useClaimsTableColumns } from "@/features/admin/claims/components/claims-table-columns";
import { useClaimsList } from "@/features/admin/claims/hooks";
import {
  usePostV1AuthLogoutMutation,
  type ModelsFlatClaimStatus,
} from "@/lib/api/generated-api";
import { formatNumberIN } from "@/lib/format";
import { clearClientSession } from "@/features/auth/logout";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/store";

const ClaimReviewDialog = dynamic(
  () =>
    import("./claim-review-dialog").then((module) => ({
      default: module.ClaimReviewDialog,
    })),
  { ssr: false },
);

type ClaimsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function ClaimsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: ClaimsClientProps) {
  const {
    actionInProgress,
    claims,
    claimsQuery,
    detailQuery,
    handleApprove,
    handleReject,
    isFetching,
    isRejecting,
    page,
    pageSize,
    refetch,
    rejectReason,
    rejectingClaim,
    resolvedPageEnd,
    resolvedPageStart,
    resolvedTotalPages,
    search,
    selectedClaim,
    selectedClaimId,
    setPage,
    setPageSize,
    setRejectReason,
    setRejectingClaim,
    setSearch,
    setSelectedClaimId,
    setStatus,
    showEmptyClaims,
    status,
    totalItems,
  } = useClaimsList({ societyId });

  const columns = useClaimsTableColumns({
    actionInProgress,
    onApprove: handleApprove,
    onReject: setRejectingClaim,
    onView: setSelectedClaimId,
  });

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          actions={<RefreshButton loading={isFetching} onClick={refetch} />}
          description="Review resident requests, inspect flat details, and approve or reject pending claims."
          eyebrow="Community access"
          title="Flat Claims"
        />

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle>Claim Directory</CardTitle>
                <CardDescription>
                  {claims.length > 0
                    ? `Showing ${formatNumberIN(resolvedPageStart)}-${formatNumberIN(resolvedPageEnd)} claims`
                    : "0 claims shown"}
                </CardDescription>
              </div>
              <ListToolbar className="border-0 bg-transparent p-0 sm:flex-nowrap">
                <SearchInput
                  className="min-w-[220px]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search claims"
                  value={search}
                />
                <FilterSelect
                  aria-label="Filter by status"
                  onChange={(event) =>
                    setStatus(
                      event.target.value as ModelsFlatClaimStatus | "all",
                    )
                  }
                  options={[
                    { label: "All statuses", value: "all" },
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                    { label: "Cancelled", value: "cancelled" },
                  ]}
                  value={status}
                />
                <FilterSelect
                  aria-label="Rows per page"
                  onChange={(event) =>
                    setPageSize(Number.parseInt(event.target.value, 10))
                  }
                  options={[
                    { label: "10 / page", value: "10" },
                    { label: "20 / page", value: "20" },
                    { label: "50 / page", value: "50" },
                  ]}
                  value={String(pageSize)}
                />
              </ListToolbar>
            </div>
          </CardHeader>
          <CardContent>
            <AsyncPanel
              empty={showEmptyClaims}
              emptyDescription="Try changing the search or status filter."
              emptyTitle="No claims found"
              error={
                claimsQuery.isError && !showEmptyClaims
                  ? "Refresh the claim directory and try again."
                  : null
              }
              loading={claimsQuery.isLoading}
              loadingLabel="Loading claims"
              onRetry={refetch}
            >
              <ClaimsTable
                claims={claims}
                columns={columns}
                isFetching={isFetching}
                onPageChange={setPage}
                onRowClick={(claim) => setSelectedClaimId(claim.id ?? null)}
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={resolvedTotalPages}
              />
            </AsyncPanel>
          </CardContent>
        </Card>

        {selectedClaimId || rejectingClaim ? (
          <ClaimReviewDialog
            actionInProgress={actionInProgress}
            detailQuery={detailQuery}
            isRejecting={isRejecting}
            onApprove={handleApprove}
            onOpenChange={(open) => {
              if (!open) setSelectedClaimId(null);
            }}
            onReject={handleReject}
            onRejectOpenChange={(open) => {
              if (!open) {
                setRejectingClaim(null);
                setRejectReason("");
              }
            }}
            onRejectReasonChange={setRejectReason}
            onStartReject={setRejectingClaim}
            open={Boolean(selectedClaimId)}
            rejectOpen={Boolean(rejectingClaim)}
            rejectReason={rejectReason}
            rejectingClaim={rejectingClaim}
            selectedClaim={selectedClaim}
          />
        ) : null}
      </main>
    </PageShell>
  );
}
