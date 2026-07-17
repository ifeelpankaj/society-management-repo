"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FilterPanel } from "@/components/data/filter-panel";
import { ListToolbar } from "@/components/data/list-toolbar";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { FilterSelect } from "@/components/forms/filter-select";
import { AsyncPanel } from "@/components/shared/async-panel";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { SmartTable } from "@/components/tables/smart-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVisitorsTableColumns } from "@/features/admin/visitors/components/visitors-table-columns";
import { VisitorStatsCards } from "@/features/admin/visitors/components/visitor-stats-cards";
import { useVisitorsList } from "@/features/admin/visitors/hooks";
import type {
  VisitorPurpose,
  VisitorSource,
  VisitorStatus,
} from "@/lib/api/visitor-types";
import { VISITOR_PURPOSE_LABELS } from "@/lib/constants/visitor-purpose";
import { VISITOR_SOURCE_LABELS } from "@/lib/constants/visitor-source";
import { VISITOR_STATUS_LABELS } from "@/lib/constants/visitor-status";
import { formatNumberIN } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type VisitorsClientProps = {
  societyId: number;
  encodedSocietyId: string;
};

export function VisitorsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: VisitorsClientProps) {
  const router = useRouter();
  const {
    block,
    createdFrom,
    createdTo,
    entries,
    isEmpty,
    isError,
    isFetching,
    isLoading,
    page,
    pageEnd,
    pageSize,
    pageStart,
    purpose,
    refetch,
    setBlock,
    setCreatedFrom,
    setCreatedTo,
    setPage,
    setPageSize,
    setPurpose,
    setSource,
    setStatus,
    source,
    stats,
    statsQuery,
    status,
    total,
    totalPages,
  } = useVisitorsList({ societyId });

  const openEntry = (entryId: number | null) => {
    if (!entryId) return;
    router.push(paths.visitorDetail(societyId, entryId));
  };

  const columns = useVisitorsTableColumns({ onView: openEntry });

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <>
            <RefreshButton loading={isFetching} onClick={refetch} />
            <Button asChild type="button" variant="outline">
              <Link href={paths.visitorApprovals(societyId)}>
                Pending approvals
              </Link>
            </Button>
          </>
        }
        description="Track visitor entries, monitor gate activity, and review access history."
        eyebrow="Gate operations"
        title="Visitors"
      />

      <VisitorStatsCards loading={statsQuery.isLoading} stats={stats} />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Visitor Directory</CardTitle>
              <CardDescription>
                {total > 0
                  ? `Showing ${formatNumberIN(pageStart)}-${formatNumberIN(pageEnd)} of ${formatNumberIN(total)} entries`
                  : "0 entries shown"}
              </CardDescription>
            </div>
            <div className="space-y-3">
              <ListToolbar className="border-0 bg-transparent p-0 sm:grid sm:grid-cols-[150px_150px_150px]">
                <FilterSelect
                  aria-label="Filter by status"
                  onChange={(event) =>
                    setStatus(event.target.value as VisitorStatus | "all")
                  }
                  options={[
                    { label: "All status", value: "all" },
                    ...Object.entries(VISITOR_STATUS_LABELS).map(
                      ([value, label]) => ({ label, value }),
                    ),
                  ]}
                  value={status}
                />
                <FilterSelect
                  aria-label="Filter by purpose"
                  onChange={(event) =>
                    setPurpose(event.target.value as VisitorPurpose | "all")
                  }
                  options={[
                    { label: "All purposes", value: "all" },
                    ...Object.entries(VISITOR_PURPOSE_LABELS).map(
                      ([value, label]) => ({ label, value }),
                    ),
                  ]}
                  value={purpose}
                />
                <FilterSelect
                  aria-label="Filter by source"
                  onChange={(event) =>
                    setSource(event.target.value as VisitorSource | "all")
                  }
                  options={[
                    { label: "All sources", value: "all" },
                    ...Object.entries(VISITOR_SOURCE_LABELS).map(
                      ([value, label]) => ({ label, value }),
                    ),
                  ]}
                  value={source}
                />
              </ListToolbar>
              <FilterPanel>
                <Input
                  aria-label="Filter by block"
                  onChange={(event) => setBlock(event.target.value)}
                  placeholder="Block"
                  value={block}
                />
                <Input
                  aria-label="Filter by created from"
                  onChange={(event) => setCreatedFrom(event.target.value)}
                  placeholder="Created from (YYYY-MM-DD)"
                  value={createdFrom}
                />
                <Input
                  aria-label="Filter by created to"
                  onChange={(event) => setCreatedTo(event.target.value)}
                  placeholder="Created to (YYYY-MM-DD)"
                  value={createdTo}
                />
              </FilterPanel>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AsyncPanel
            empty={isEmpty}
            emptyDescription="Try changing the filters or date range."
            emptyTitle="No visitor entries found"
            error={isError ? "Refresh the visitor directory and try again." : null}
            loading={isLoading}
            loadingLabel="Loading visitors"
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
    </WorkspacePage>
  );
}
