"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { AsyncPanel } from "@/components/shared/async-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { RoleBadge } from "@/components/shared/role-badge";
import { WorkspacePage } from "@/components/shared/workspace-page";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { SmartTable } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResidentsList } from "@/features/admin/residents/hooks";
import { isRoleKey } from "@/features/auth/profile/profile-utils";
import type { ModelsSocietyMemberResponse } from "@/lib/api/generated-api";
import {
  formatNumberIN,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { paths } from "@/lib/routes/paths";

import { ResidentRowActions } from "./resident-row-actions";
import { ResidentSummaryCards } from "./resident-summary-cards";
import { ResidentTableToolbar } from "./resident-table-toolbar";

function memberName(member: ModelsSocietyMemberResponse) {
  return (
    member.user_full_name || member.user_email || `User #${member.user_id}`
  );
}

export function ResidentsClient({
  societyId,
  encodedSocietyId: _encodedSocietyId,
}: {
  societyId: number;
  encodedSocietyId: string;
}) {
  const router = useRouter();
  const {
    isEmpty,
    isError,
    isFetching,
    isLoading,
    joinedFrom,
    joinedTo,
    members,
    page,
    pageEnd,
    pageSize,
    pageStart,
    refetch,
    role,
    search,
    searchMode,
    setJoinedFrom,
    setJoinedTo,
    setPage,
    setPageSize,
    setRole,
    setSearch,
    setSearchMode,
    setSortBy,
    setSortOrder,
    setStatus,
    sortBy,
    sortOrder,
    status,
    summary,
    total,
    totalPages,
  } = useResidentsList({ societyId });

  const columns = useMemo<SmartTableColumn<ModelsSocietyMemberResponse>[]>(
    () => [
      {
        accessorKey: "user_full_name",
        header: "Member",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{memberName(row.original)}</p>
            <p className="text-muted-foreground text-xs">
              User #{row.original.user_id}
            </p>
          </div>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-sm">
            <p>{row.original.user_email ?? "Email not set"}</p>
            <p className="text-muted-foreground text-xs">
              {row.original.user_phone ?? "Phone not set"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) =>
          row.original.role && isRoleKey(row.original.role) ? (
            <RoleBadge role={row.original.role} />
          ) : (
            <Badge variant="secondary">
              {titleCaseFromSnake(row.original.role)}
            </Badge>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "active"
                ? "default"
                : row.original.status === "suspended"
                  ? "destructive"
                  : "outline"
            }
          >
            {titleCaseFromSnake(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "joined_at",
        header: "Joined",
        cell: ({ row }) => formatShortDateIN(row.original.joined_at, "Not set"),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => (
          <ResidentRowActions
            memberId={row.original.id}
            societyId={societyId}
          />
        ),
      },
    ],
    [societyId],
  );

  return (
    <WorkspacePage>
      <PageHeader
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
        description="Manage society members, roles, access status, and ownership."
        eyebrow="Community directory"
        title="Residents"
      />

      <ResidentSummaryCards summary={summary} />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>
                {total > 0
                  ? `Showing ${formatNumberIN(pageStart)}-${formatNumberIN(pageEnd)} of ${formatNumberIN(total)} members`
                  : "0 members shown"}
              </CardDescription>
            </div>
            <ResidentTableToolbar
              joinedFrom={joinedFrom}
              joinedTo={joinedTo}
              onJoinedFromChange={setJoinedFrom}
              onJoinedToChange={setJoinedTo}
              onRoleChange={setRole}
              onSearchChange={setSearch}
              onSearchModeChange={setSearchMode}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onStatusChange={setStatus}
              role={role}
              search={search}
              searchMode={searchMode}
              sortBy={sortBy}
              sortOrder={sortOrder}
              status={status}
            />
          </div>
        </CardHeader>
        <CardContent>
          <AsyncPanel
            empty={isEmpty}
            emptyDescription="Try changing the search or filters."
            emptyTitle="No members found"
            error={isError ? "Refresh the directory and try again." : null}
            loading={isLoading}
            loadingLabel="Loading members"
            onRetry={refetch}
          >
            <div className="space-y-4">
              <SmartTable
                columns={columns}
                data={members}
                emptyState={
                  <EmptyState
                    className="border-0"
                    title="No members found"
                    description="Try changing the search or filters."
                  />
                }
                loading={isLoading}
                onRowClick={(member) => {
                  if (!member.id) return;
                  router.push(paths.residentDetail(societyId, member.id));
                }}
                rowKey={(member) => member.id ?? member.user_id ?? "member"}
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
