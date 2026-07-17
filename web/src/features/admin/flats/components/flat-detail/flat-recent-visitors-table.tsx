"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { EmptyState } from "@/components/shared/empty-state";
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
import type { FlatVisitorContext } from "@/lib/api/visitor-types";
import {
  VISITOR_PURPOSE_LABELS,
  type VisitorPurposeKey,
} from "@/lib/constants/visitor-purpose";
import {
  VISITOR_STATUS_LABELS,
  VISITOR_STATUS_STYLES,
  type VisitorStatusKey,
} from "@/lib/constants/visitor-status";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";
import { cn } from "@/lib/utils";

type RecentVisitorRow = NonNullable<
  FlatVisitorContext["recent_visitors"]
>[number];

type FlatRecentVisitorsTableProps = {
  societyId: number;
  context?: FlatVisitorContext;
  loading?: boolean;
};

export function FlatRecentVisitorsTable({
  societyId,
  context,
  loading,
}: FlatRecentVisitorsTableProps) {
  const router = useRouter();
  const visitors = context?.recent_visitors ?? [];

  const columns = useMemo<SmartTableColumn<RecentVisitorRow>[]>(
    () => [
      {
        id: "name",
        header: "Visitor",
        cell: ({ row }) => (
          <p className="font-medium">
            {row.original.full_name ?? "Unknown visitor"}
          </p>
        ),
      },
      {
        id: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
          const purpose = row.original.purpose;
          if (!purpose) return "—";
          return (
            VISITOR_PURPOSE_LABELS[purpose as VisitorPurposeKey] ??
            titleCaseFromSnake(purpose)
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          if (!status) return "—";
          const label =
            VISITOR_STATUS_LABELS[status as VisitorStatusKey] ??
            titleCaseFromSnake(status);

          return (
            <Badge
              className={cn(
                "border",
                VISITOR_STATUS_STYLES[status as VisitorStatusKey],
              )}
              variant="outline"
            >
              {label}
            </Badge>
          );
        },
      },
      {
        id: "visited_on",
        header: "Visited on",
        cell: ({ row }) => formatShortDateIN(row.original.visited_on),
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent visitors</CardTitle>
        <CardDescription>Last 10 visitor entries for this flat.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading visitors...</p>
        ) : visitors.length > 0 ? (
          <SmartTable
            columns={columns}
            data={visitors}
            onRowClick={(row) => {
              if (row.entry_id) {
                router.push(paths.visitorDetail(societyId, row.entry_id));
              }
            }}
            rowKey={(row, index) =>
              String(row.entry_id ?? row.full_name ?? index)
            }
          />
        ) : (
          <EmptyState
            className="border-0 bg-muted/20"
            description="Visitor entries will appear here once people check in."
            title="No recent visitors"
          />
        )}
      </CardContent>
    </Card>
  );
}
