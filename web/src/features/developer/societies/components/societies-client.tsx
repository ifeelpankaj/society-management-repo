"use client";

import type { CellContext } from "@tanstack/react-table";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SectionCard } from "@/components/shared/section-card";
import {
  SmartTable,
  type SmartTableColumn,
} from "@/components/tables/smart-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type ModelsSocietyResponse,
  type ModelsSocietyStatus,
  useGetV1DeveloperDashboardBootstrapQuery,
  useGetV1SocietiesQuery,
  usePostV1SocietiesBySocietyIdApproveMutation,
  usePostV1SocietiesBySocietyIdRejectMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { formatNumberIN, titleCaseFromSnake } from "@/lib/format";
import { SocietyStatusBadge } from "./society-status-badge";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const statusOptions: Array<ModelsSocietyStatus | "all"> = [
  "pending",
  "active",
  "suspended",
  "rejected",
  "all",
];
const limitOptions = [10, 25, 50, 100];
const sortOptions = [
  { label: "Newest", sortBy: "created_at", sortOrder: "desc" },
  { label: "Oldest", sortBy: "created_at", sortOrder: "asc" },
  { label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
  { label: "Name Z-A", sortBy: "name", sortOrder: "desc" },
  { label: "City A-Z", sortBy: "city", sortOrder: "asc" },
  { label: "Status", sortBy: "status", sortOrder: "asc" },
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function statusFromParam(value: string | null): ModelsSocietyStatus | "all" {
  if (
    value === "active" ||
    value === "suspended" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }
  return "pending";
}

function sortValue(sortBy: string, sortOrder: string) {
  return `${sortBy}:${sortOrder}`;
}

export function SocietiesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rejecting, setRejecting] = useState<ModelsSocietyResponse | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const search = searchParams.get("search") ?? "";
  const status = statusFromParam(searchParams.get("status"));
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limitParam = parsePositiveInt(searchParams.get("limit"), 25);
  const limit = limitOptions.includes(limitParam) ? limitParam : 25;
  const sortBy = searchParams.get("sortBy") ?? "created_at";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const offset = (page - 1) * limit;

  const societiesQuery = useGetV1SocietiesQuery({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    limit,
    offset,
    sortBy,
    sortOrder,
  });
  const developerDashboardQuery = useGetV1DeveloperDashboardBootstrapQuery();
  const [approveSociety, { isLoading: isApproving }] =
    usePostV1SocietiesBySocietyIdApproveMutation();
  const [rejectSociety, { isLoading: isRejecting }] =
    usePostV1SocietiesBySocietyIdRejectMutation();

  const paginatedSocieties = societiesQuery.data?.data?.societies;
  const societies = paginatedSocieties?.items ?? [];
  const total = paginatedSocieties?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstResult = total > 0 ? offset + 1 : 0;
  const lastResult = Math.min(offset + societies.length, total);
  const actionInProgress = isApproving || isRejecting;

  const updateParams = (
    updates: Record<string, string | number | undefined>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    router.replace(`/developer/societies?${params.toString()}`);
  };

  const refetch = useCallback(() => {
    societiesQuery.refetch();
    developerDashboardQuery.refetch();
  }, [developerDashboardQuery, societiesQuery]);

  const handleApprove = useCallback(
    async (society: ModelsSocietyResponse) => {
      if (!society.id) return;
      const toastId = toast.loading("Approving society...");

      try {
        const response = await approveSociety({
          societyId: society.id,
        }).unwrap();
        toast.success(
          getApiMessage(response, "Society approved successfully."),
          {
            id: toastId,
          },
        );
        refetch();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not approve society."), {
          id: toastId,
        });
      }
    },
    [approveSociety, refetch],
  );

  const handleReject = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!rejecting?.id) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Rejection reason is required.");
      return;
    }
    const toastId = toast.loading("Rejecting society...");

    try {
      const response = await rejectSociety({
        societyId: rejecting.id,
        modelsSocietyReasonRequest: { reason },
      }).unwrap();
      toast.success(getApiMessage(response, "Society rejected successfully."), {
        id: toastId,
      });
      setRejecting(null);
      setRejectReason("");
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not reject society."), {
        id: toastId,
      });
    }
  };

  const columns = useMemo<SmartTableColumn<ModelsSocietyResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Society",
        cell: ({ row }) => {
          const society = row.original;

          return (
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium">
                  {society.name ?? "Unnamed society"}
                </span>
                <SocietyStatusBadge status={society.status} />
              </div>
              <p className="text-muted-foreground text-sm">
                {society.society_code ?? "Code not generated"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "city",
        header: "Location",
        cell: ({ row }) => {
          const society = row.original;
          const location = [society.city, society.state].filter(Boolean);

          return location.length ? location.join(", ") : "Location not set";
        },
      },
      {
        accessorKey: "total_flats",
        header: "Flats",
        cell: ({ row }) => formatNumberIN(row.original.total_flats),
      },
      {
        accessorKey: "total_blocks",
        header: "Blocks",
        cell: ({ row }) => formatNumberIN(row.original.total_blocks),
      },
      {
        id: "actions",
        header: "",
        meta: { className: "text-right", headerClassName: "w-64" },
        cell: ({ row }: CellContext<ModelsSocietyResponse, unknown>) => {
          const society = row.original;

          return (
            <div className="flex flex-wrap justify-end gap-2">
              {society.status === "pending" ? (
                <>
                  <Button
                    disabled={actionInProgress}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleApprove(society);
                    }}
                    size="sm"
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Approve
                  </Button>
                  <Button
                    disabled={actionInProgress}
                    onClick={(event) => {
                      event.stopPropagation();
                      setRejecting(society);
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>
                </>
              ) : null}
              <Button
                disabled={!society.id}
                onClick={(event) => {
                  event.stopPropagation();
                  if (society.id)
                    router.push(`/developer/societies/${society.id}`);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Eye className="size-4" />
                Details
              </Button>
            </div>
          );
        },
      },
    ],
    [actionInProgress, handleApprove, router],
  );

  return (
    <PageShell background="tinted" className="min-h-full py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          actions={
            <RefreshButton
              loading={societiesQuery.isFetching}
              onClick={refetch}
            />
          }
          description="Search, review, and open a society to manage lifecycle and subscription settings."
          eyebrow="Developer workspace"
          title="Societies"
        />

        <SectionCard
          contentClassName="space-y-4"
          description={`${formatNumberIN(total)} societies match the current parameters`}
          title="Society Directory"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search societies"
                value={search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
              />
            </div>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
              value={status}
              onChange={(event) =>
                updateParams({ status: event.target.value, page: 1 })
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {titleCaseFromSnake(option)}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
              value={sortValue(sortBy, sortOrder)}
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] =
                  event.target.value.split(":");
                updateParams({
                  sortBy: nextSortBy,
                  sortOrder: nextSortOrder,
                  page: 1,
                });
              }}
            >
              {sortOptions.map((option) => (
                <option
                  key={sortValue(option.sortBy, option.sortOrder)}
                  value={sortValue(option.sortBy, option.sortOrder)}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
              value={limit}
              onChange={(event) =>
                updateParams({ limit: event.target.value, page: 1 })
              }
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>

          <SmartTable
            columns={columns}
            data={societies}
            emptyState={
              <EmptyState
                className="border-0"
                title="No societies found"
                description="Change the URL parameters or refresh the list."
              />
            }
            loading={societiesQuery.isLoading || societiesQuery.isFetching}
            onRowClick={(society) => {
              if (society.id) router.push(`/developer/societies/${society.id}`);
            }}
            rowKey={(society, index) => society.id ?? index}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {formatNumberIN(firstResult)}-{formatNumberIN(lastResult)}{" "}
              of {formatNumberIN(total)}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                disabled={page <= 1 || societiesQuery.isFetching}
                onClick={() => updateParams({ page: page - 1 })}
                type="button"
                variant="outline"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="min-w-24 text-center text-sm">
                Page {formatNumberIN(page)} of {formatNumberIN(totalPages)}
              </span>
              <Button
                disabled={page >= totalPages || societiesQuery.isFetching}
                onClick={() => updateParams({ page: page + 1 })}
                type="button"
                variant="outline"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </SectionCard>

        <Dialog
          open={!!rejecting}
          onOpenChange={(open) => {
            if (!open) {
              setRejecting(null);
              setRejectReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Society</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleReject}>
              <Input
                autoFocus
                placeholder="Rejection reason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejecting(null);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button disabled={isRejecting} type="submit">
                  Reject
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </PageShell>
  );
}
