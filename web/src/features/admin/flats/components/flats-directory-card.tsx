"use client";

import { ListToolbar } from "@/components/data/list-toolbar";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { FilterSelect } from "@/components/forms/filter-select";
import { AsyncPanel } from "@/components/shared/async-panel";
import { SearchInput } from "@/components/shared/search-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlatsTable } from "@/features/admin/flats/components/flats-table";
import type {
  ModelsFlatResponse,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";
import { formatNumberIN } from "@/lib/format";

type FlatsDirectoryCardProps = {
  actionInProgress: boolean;
  flats: ModelsFlatResponse[];
  isEmpty: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onBlockToggle: (flat: ModelsFlatResponse) => void;
  onDeactivate: (flat: ModelsFlatResponse) => void;
  onEdit: (flat: ModelsFlatResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefetch: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: ModelsFlatStatus | "all") => void;
  page: number;
  pageEnd: number;
  pageSize: number;
  pageStart: number;
  search: string;
  status: ModelsFlatStatus | "all";
  totalFlats: number;
  totalPages: number;
};

export function FlatsDirectoryCard({
  actionInProgress,
  flats,
  isEmpty,
  isError,
  isFetching,
  isLoading,
  onBlockToggle,
  onDeactivate,
  onEdit,
  onPageChange,
  onPageSizeChange,
  onRefetch,
  onSearchChange,
  onStatusChange,
  page,
  pageEnd,
  pageSize,
  pageStart,
  search,
  status,
  totalFlats,
  totalPages,
}: FlatsDirectoryCardProps) {
  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Flat Directory</CardTitle>
            <CardDescription>
              {totalFlats > 0
                ? `Showing ${formatNumberIN(pageStart)}-${formatNumberIN(pageEnd)} of ${formatNumberIN(totalFlats)} flats`
                : `${formatNumberIN(flats.length)} flats shown`}
            </CardDescription>
          </div>
          <ListToolbar className="border-0 bg-transparent p-0 sm:flex-nowrap">
            <SearchInput
              className="min-w-[220px]"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search flats"
              value={search}
            />
            <FilterSelect
              aria-label="Filter by status"
              onChange={(event) =>
                onStatusChange(event.target.value as ModelsFlatStatus | "all")
              }
              options={[
                { label: "All statuses", value: "all" },
                { label: "Vacant", value: "vacant" },
                { label: "Occupied", value: "occupied" },
                { label: "Blocked", value: "blocked" },
              ]}
              value={status}
            />
            <FilterSelect
              aria-label="Rows per page"
              onChange={(event) =>
                onPageSizeChange(Number.parseInt(event.target.value, 10))
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
          empty={isEmpty}
          emptyDescription="Create the first flat to start building this society inventory."
          emptyTitle="No flats found"
          error={isError ? "Refresh the directory and try again." : null}
          loading={isLoading}
          loadingLabel="Loading flats"
          onRetry={onRefetch}
        >
          <div className="space-y-4">
            <FlatsTable
              actionInProgress={actionInProgress}
              flats={flats}
              loading={isLoading}
              onBlockToggle={onBlockToggle}
              onDeactivate={onDeactivate}
              onEdit={onEdit}
            />
            <PaginationFooter
              loading={isFetching}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              page={page}
              pageSize={pageSize}
              totalItems={totalFlats}
              totalPages={totalPages}
            />
          </div>
        </AsyncPanel>
      </CardContent>
    </Card>
  );
}
