"use client";

import { FilterPanel } from "@/components/data/filter-panel";
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
import { Input } from "@/components/ui/input";
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
  block: string;
  floor: string;
  flatNumber: string;
  isActive: "all" | "true" | "false";
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onBlockChange: (value: string) => void;
  onFloorChange: (value: string) => void;
  onFlatNumberChange: (value: string) => void;
  onIsActiveChange: (value: "all" | "true" | "false") => void;
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
  block,
  floor,
  flatNumber,
  isActive,
  onBlockChange,
  onFloorChange,
  onFlatNumberChange,
  onIsActiveChange,
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
          <div className="space-y-3">
            <ListToolbar className="border-0 bg-transparent p-0 sm:grid sm:grid-cols-[minmax(220px,1fr)_160px]">
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
                  { label: "All status", value: "all" },
                  { label: "Vacant", value: "vacant" },
                  { label: "Occupied", value: "occupied" },
                  { label: "Blocked", value: "blocked" },
                ]}
                value={status}
              />
            </ListToolbar>
            <FilterPanel>
              <Input
                aria-label="Filter by block"
                onChange={(event) => onBlockChange(event.target.value)}
                placeholder="Block"
                value={block}
              />
              <Input
                aria-label="Filter by floor"
                onChange={(event) => onFloorChange(event.target.value)}
                placeholder="Floor"
                value={floor}
              />
              <Input
                aria-label="Filter by flat number"
                onChange={(event) => onFlatNumberChange(event.target.value)}
                placeholder="Flat number"
                value={flatNumber}
              />
              <FilterSelect
                aria-label="Filter by active state"
                onChange={(event) =>
                  onIsActiveChange(
                    event.target.value as "all" | "true" | "false",
                  )
                }
                options={[
                  { label: "All states", value: "all" },
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
                value={isActive}
              />
            </FilterPanel>
          </div>
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
