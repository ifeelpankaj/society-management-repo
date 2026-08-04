"use client";

import { useRouter } from "next/navigation";
import { ListToolbar } from "@/components/data/list-toolbar";
import { FilterSelect } from "@/components/forms/filter-select";
import { AsyncPanel } from "@/components/shared/async-panel";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { WorkspacePage } from "@/components/shared/workspace-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClaimsStatsTiles } from "@/features/admin/claims/components/claims-stats-tiles";
import { ClaimsTable } from "@/features/admin/claims/components/claims-table";
import { useClaimsTableColumns } from "@/features/admin/claims/components/claims-table-columns";
import { useClaimsList } from "@/features/admin/claims/hooks";
import type { ModelsFlatClaimStatus } from "@/lib/api/generated-api";
import { useGetV1SocietyFlatClaimStatsQuery } from "@/lib/api/society-flat-claims-api";
import { formatNumberIN } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type ClaimsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function ClaimsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: ClaimsClientProps) {
  const router = useRouter();
  const {
    claims,
    claimsQuery,
    isFetching,
    page,
    pageSize,
    refetch,
    resolvedPageEnd,
    resolvedPageStart,
    resolvedTotalPages,
    search,
    searchMode,
    setPage,
    setPageSize,
    setSearch,
    setSearchMode,
    setStatus,
    showEmptyClaims,
    status,
    totalItems,
  } = useClaimsList({ societyId });

  const openClaim = (claimId: number | null) => {
    if (!claimId) return;
    router.push(paths.claimDetail(societyId, claimId));
  };

  const columns = useClaimsTableColumns({
    onView: openClaim,
  });
  const { data: claimStatsData, isLoading: isLoadingClaimStats } =
    useGetV1SocietyFlatClaimStatsQuery({ societyId });

  return (
    <WorkspacePage>
      <PageHeader
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
        description="Review resident requests, inspect flat details, and approve or reject pending claims."
        eyebrow="Community access"
        title="Flat Claims"
      />

      <ClaimsStatsTiles
        loading={isLoadingClaimStats}
        stats={claimStatsData?.data?.stats}
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
            <div className="space-y-3">
              <ListToolbar className="border-0 bg-transparent p-0 sm:grid sm:grid-cols-[minmax(220px,1fr)_160px_150px]">
                <SearchInput
                  className="min-w-[220px]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search claims"
                  value={search}
                />
                <FilterSelect
                  aria-label="Search claims by"
                  onChange={(event) => setSearchMode(event.target.value)}
                  options={[
                    { label: "All fields", value: "all" },
                    { label: "Claimant", value: "claimant" },
                    { label: "Flat", value: "flat" },
                    { label: "Reviewer", value: "reviewer" },
                  ]}
                  value={searchMode}
                />
                <FilterSelect
                  aria-label="Filter by status"
                  onChange={(event) =>
                    setStatus(
                      event.target.value as ModelsFlatClaimStatus | "all",
                    )
                  }
                  options={[
                    { label: "All status", value: "all" },
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                    { label: "Cancelled", value: "cancelled" },
                  ]}
                  value={status}
                />
              </ListToolbar>
            </div>
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
              onPageSizeChange={setPageSize}
              onRowClick={(claim) => openClaim(claim.id ?? null)}
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={resolvedTotalPages}
            />
          </AsyncPanel>
        </CardContent>
      </Card>
    </WorkspacePage>
  );
}
