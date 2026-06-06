"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { FilterPanel } from "@/components/data/filter-panel";
import { ListToolbar } from "@/components/data/list-toolbar";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { FilterSelect } from "@/components/forms/filter-select";
import { AsyncPanel } from "@/components/shared/async-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ModelsFlatResidentRole,
  ModelsFlatResidentStatus,
} from "@/lib/api/generated-api";
import { useGetV1FlatResidentsQuery } from "@/lib/api/generated-api";
import { formatNumberIN, titleCaseFromSnake } from "@/lib/format";
import { useDebouncedValue, usePagination } from "@/lib/hooks";
import { paths } from "@/lib/routes/paths";

export function ResidencesClient() {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 2000);
  const [role, setRole] = useState<ModelsFlatResidentRole | "all">("all");
  const [status, setStatus] = useState<ModelsFlatResidentStatus | "all">("all");
  const [isPrimary, setIsPrimary] = useState<"all" | "true" | "false">("all");
  const estimatedTotalRef = useRef(0);

  const { page, pageSize, offset, totalPages, setPage, setPageSize } =
    usePagination({
      totalItems: estimatedTotalRef.current,
      resetDeps: [debouncedSearch, searchMode, role, status, isPrimary],
    });

  const residentsQuery = useGetV1FlatResidentsQuery({
    search: debouncedSearch.trim() || undefined,
    searchMode,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
    isPrimary: isPrimary === "all" ? undefined : isPrimary === "true",
    limit: pageSize,
    offset,
  });
  const residents = residentsQuery.data?.data?.residents ?? [];
  const hasNextPage = residents.length >= pageSize;
  estimatedTotalRef.current = hasNextPage
    ? page * pageSize + 1
    : (page - 1) * pageSize + residents.length;
  const resolvedTotalPages = hasNextPage
    ? Math.max(totalPages, page + 1)
    : page;

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton
            loading={residentsQuery.isFetching}
            onClick={() => residentsQuery.refetch()}
          />
        }
        description="Inspect resident occupancy across societies and flats."
        eyebrow="Developer workspace"
        title="Residences"
      />

      <SectionCard
        contentClassName="space-y-4"
        description={`${formatNumberIN(residents.length)} residences returned`}
        title="Resident Directory"
      >
        <div className="space-y-3">
          <ListToolbar className="border-0 bg-transparent p-0 lg:grid lg:grid-cols-[minmax(220px,1fr)_150px_130px_140px]">
            <SearchInput
              aria-label="Search residents"
              className="min-w-[220px]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search residents"
              value={search}
            />
            <FilterSelect
              aria-label="Search residences by"
              onChange={(event) => setSearchMode(event.target.value)}
              options={[
                { label: "All fields", value: "all" },
                { label: "Resident", value: "resident" },
                { label: "Society", value: "society" },
                { label: "Flat", value: "flat" },
              ]}
              value={searchMode}
            />
            <FilterSelect
              aria-label="Filter by role"
              onChange={(event) =>
                setRole(event.target.value as ModelsFlatResidentRole | "all")
              }
              options={[
                { label: "All roles", value: "all" },
                { label: "Owner", value: "owner" },
                { label: "Tenant", value: "tenant" },
                { label: "Family", value: "family" },
              ]}
              value={role}
            />
            <FilterSelect
              aria-label="Filter by status"
              onChange={(event) =>
                setStatus(
                  event.target.value as ModelsFlatResidentStatus | "all",
                )
              }
              options={[
                { label: "All status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Moved Out", value: "moved_out" },
              ]}
              value={status}
            />
          </ListToolbar>
          <FilterPanel>
            <FilterSelect
              aria-label="Filter by primary state"
              onChange={(event) =>
                setIsPrimary(event.target.value as "all" | "true" | "false")
              }
              options={[
                { label: "All primary", value: "all" },
                { label: "Primary", value: "true" },
                { label: "Not primary", value: "false" },
              ]}
              value={isPrimary}
            />
          </FilterPanel>
        </div>

        <AsyncPanel
          empty={!residentsQuery.isLoading && residents.length === 0}
          emptyDescription="Change the filters or refresh the directory."
          emptyTitle="No residences found"
          error={
            residentsQuery.isError
              ? "Refresh the resident directory and try again."
              : null
          }
          loading={residentsQuery.isLoading}
          loadingLabel="Loading residents"
          onRetry={() => residentsQuery.refetch()}
        >
          <div className="space-y-4">
            {residents.length > 0 ? (
              <div className="divide-y divide-border rounded-lg border border-border">
                {residents.map((resident) => (
                  <div
                    className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
                    key={resident.id}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Home className="size-4 text-muted-foreground" />
                        <p className="truncate font-medium">
                          {resident.user_name ??
                            resident.user_email ??
                            `User #${resident.user_id}`}
                        </p>
                        <Badge variant="secondary">
                          {titleCaseFromSnake(resident.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {resident.society_name ?? "Society"} -{" "}
                        {resident.flat_number ?? `Flat #${resident.flat_id}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {titleCaseFromSnake(resident.role)}
                        </Badge>
                        {resident.is_primary ? (
                          <Badge variant="default">Primary</Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {resident.society_id && resident.user_id ? (
                          <Button
                            asChild
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Link
                              href={paths.developerResidenceUser(
                                resident.society_id,
                                resident.user_id,
                              )}
                            >
                              Open member
                            </Link>
                          </Button>
                        ) : null}
                        {resident.society_id && resident.flat_id ? (
                          <Button
                            asChild
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Link
                              href={paths.developerFlatDetail(
                                resident.society_id,
                                resident.flat_id,
                              )}
                            >
                              Open flat
                            </Link>
                          </Button>
                        ) : null}
                        {resident.society_id &&
                        resident.flat_id &&
                        resident.id ? (
                          <Button
                            asChild
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Link
                              href={paths.developerFlatResidentDetail(
                                resident.society_id,
                                resident.flat_id,
                                resident.id,
                              )}
                            >
                              View resident
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Change the filters or refresh the directory."
                title="No residences found"
              />
            )}
            <PaginationFooter
              loading={residentsQuery.isFetching}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              page={page}
              pageSize={pageSize}
              totalItems={estimatedTotalRef.current}
              totalPages={resolvedTotalPages}
            />
          </div>
        </AsyncPanel>
      </SectionCard>
    </WorkspacePage>
  );
}
