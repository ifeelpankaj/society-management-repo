"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { SmartTable } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSocietyDashboardRoute,
  isAdminSetupRole,
  isAdminWorkspaceRole,
} from "@/features/auth/auth-routing";
import { RouteGuard } from "@/features/auth/components/route-guard";
import {
  type ModelsMySocietyResponse,
  type ModelsSocietyMemberResponse,
  type ModelsSocietyResponse,
  useGetV1SocietiesMyQuery,
} from "@/lib/api/generated-api";
import { useLazyGetV1SocietiesBySocietyIdOnboardingBootstrapQuery } from "@/lib/api/society-onboarding-api";
import { getApiErrorMessage } from "@/lib/api-message";

const PAGE_SIZE = 10;

type SelectSocietyRow = {
  id: number;
  name: string;
  code: string;
  location: string;
  role: NonNullable<ModelsSocietyMemberResponse["role"]>;
  status: ModelsSocietyResponse["status"];
};

function isEligibleSociety(item: ModelsMySocietyResponse) {
  return (
    Boolean(item.society?.id ?? item.member?.society_id) &&
    item.member?.status === "active" &&
    isAdminWorkspaceRole(item.member?.role) &&
    (item.society?.status === "active" || item.society?.status === "pending")
  );
}

function formatLocation(society: ModelsSocietyResponse) {
  const parts = [society.city, society.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not set";
}

function toRow(item: ModelsMySocietyResponse): SelectSocietyRow {
  const society = item.society as ModelsSocietyResponse & { id: number };
  const member = item.member as ModelsSocietyMemberResponse & {
    role: SelectSocietyRow["role"];
    status: SelectSocietyRow["status"];
  };

  return {
    id: society.id,
    name: society.name ?? "Unnamed society",
    code: society.society_code ?? "Not generated",
    location: formatLocation(society),
    role: member.role,
    status: society.status,
  };
}

function roleLabel(role: SelectSocietyRow["role"]) {
  if (role === "owner") return "Owner";
  if (role === "staff") return "Staff";
  return "Admin";
}

function statusLabel(status: SelectSocietyRow["status"]) {
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ")
    : "Not set";
}

function SelectSocietyContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [openingSocietyId, setOpeningSocietyId] = useState<number | null>(null);
  const { data, isFetching, isLoading } = useGetV1SocietiesMyQuery();
  const [getBootstrap] =
    useLazyGetV1SocietiesBySocietyIdOnboardingBootstrapQuery();

  const rows = useMemo(
    () => (data?.data?.societies ?? []).filter(isEligibleSociety).map(toRow),
    [data?.data?.societies],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const showPagination = rows.length > PAGE_SIZE;
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openSociety = useCallback(
    async (societyId: number, role: SelectSocietyRow["role"]) => {
      setOpeningSocietyId(societyId);

      if (!isAdminSetupRole(role)) {
        router.push(getSocietyDashboardRoute(societyId));
        setOpeningSocietyId(null);
        return;
      }

      try {
        const response = await getBootstrap({ societyId }).unwrap();
        router.push(
          response.data?.onboarding?.next_path ??
            getSocietyDashboardRoute(societyId),
        );
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "We are finding the best subscription plan for your society.",
          ),
        );
      } finally {
        setOpeningSocietyId(null);
      }
    },
    [getBootstrap, router],
  );

  const columns = useMemo<ColumnDef<SelectSocietyRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Society",
        cell: ({ row }) => <p className="font-medium">{row.original.name}</p>,
      },
      {
        accessorKey: "code",
        header: "Code",
      },
      {
        accessorKey: "location",
        header: "City / State",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant={row.original.role === "owner" ? "default" : "outline"}
          >
            {roleLabel(row.original.role)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">{statusLabel(row.original.status)}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: {
          className: "text-right",
          headerClassName: "w-28",
        },
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <Button
              disabled={openingSocietyId === row.original.id}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => openSociety(row.original.id, row.original.role)}
            >
              {openingSocietyId === row.original.id ? "Opening..." : "Open"}
              <ExternalLink className="size-3.5" />
            </Button>
          ) : row.original.status === "pending" ? (
            <span className="text-muted-foreground text-sm">
              Society is in verification stage
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              We are finding the best subscription plan for your society
            </span>
          ),
      },
    ],
    [openSociety, openingSocietyId],
  );

  return (
    <WorkspacePage className="min-h-screen py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            Choose workspace
          </p>
          <h1 className="font-semibold text-3xl tracking-tight">
            Select a society
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Open a society where you are an active owner, admin, or staff
            member.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">
            <Plus className="size-4" />
            Add society
          </Link>
        </Button>
      </header>

      <SmartTable
        columns={columns}
        data={visibleRows}
        loading={isLoading || isFetching}
        rowKey="id"
        emptyState={
          <EmptyState
            className="border-0"
            title="No admin societies found"
            description="You do not have an active owner, admin, or staff membership yet. Create a society request to get started."
            action={
              <Button asChild>
                <Link href="/onboarding">
                  <Plus className="size-4" />
                  Add society
                </Link>
              </Button>
            }
          />
        }
      />

      {showPagination ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {startIndex + 1}-
            {Math.min(startIndex + PAGE_SIZE, rows.length)} of {rows.length}{" "}
            societies
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page === 1}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </Button>
            <span className="min-w-16 text-center text-sm">
              {page} / {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              size="sm"
              type="button"
              variant="outline"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </WorkspacePage>
  );
}

export default function SelectSocietyPage() {
  return (
    <RouteGuard mode="authenticated">
      <SelectSocietyContent />
    </RouteGuard>
  );
}
