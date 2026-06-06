import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useMemo } from "react";

import type { SmartTableColumn } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitorSourceBadge } from "@/features/admin/visitors/components/visitor-source-badge";
import { VisitorStatusBadge } from "@/features/admin/visitors/components/visitor-status-badge";
import type {
  VisitorEntry,
  VisitorPendingEntry,
} from "@/lib/api/visitor-types";
import { VISITOR_PURPOSE_LABELS } from "@/lib/constants/visitor-purpose";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";

export function visitorLabel(entry?: VisitorEntry | null) {
  if (!entry) return "Visitor";
  return (
    entry.visitor?.full_name ||
    entry.visitor?.phone_number ||
    `Visitor #${entry.visitor_id ?? entry.id}`
  );
}

export function visitorFlatLabel(entry?: VisitorEntry | null) {
  if (!entry?.flat) return "Flat";
  return entry.flat.block
    ? `${entry.flat.block}-${entry.flat.flat_number}`
    : (entry.flat.flat_number ?? "Flat");
}

type UseVisitorsTableColumnsOptions = {
  onView: (entryId: number | null) => void;
};

export function useVisitorsTableColumns({
  onView,
}: UseVisitorsTableColumnsOptions) {
  return useMemo<SmartTableColumn<VisitorEntry>[]>(
    () => [
      {
        id: "visitor",
        header: "Visitor",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{visitorLabel(row.original)}</p>
            <p className="truncate text-muted-foreground text-xs">
              {row.original.visitor?.phone_number ||
                row.original.visitor?.email ||
                "Contact not set"}
            </p>
          </div>
        ),
      },
      {
        id: "flat",
        header: "Flat",
        cell: ({ row }) => (
          <p className="font-medium text-sm">{visitorFlatLabel(row.original)}</p>
        ),
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
          const purpose = row.original.purpose;
          return (
            <Badge variant="secondary">
              {purpose && purpose in VISITOR_PURPOSE_LABELS
                ? VISITOR_PURPOSE_LABELS[
                    purpose as keyof typeof VISITOR_PURPOSE_LABELS
                  ]
                : titleCaseFromSnake(purpose)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <VisitorSourceBadge source={row.original.source} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <VisitorStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatShortDateIN(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => {
          const entry = row.original;
          const isPendingReview = entry.status === "waiting_approval";

          return (
            <div className="flex justify-end gap-1.5">
              <Button
                disabled={!entry.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onView(entry.id ?? null);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Eye className="size-4" />
                {isPendingReview ? "Review" : "View"}
              </Button>
            </div>
          );
        },
      },
    ],
    [onView],
  );
}

type UseVisitorApprovalsTableColumnsOptions = {
  canDecide: boolean;
  busy: boolean;
  onApprove: (entry: VisitorPendingEntry) => void;
  onReject: (entry: VisitorPendingEntry) => void;
  onView: (entryId: number | null) => void;
};

export function useVisitorApprovalsTableColumns({
  canDecide,
  busy,
  onApprove,
  onReject,
  onView,
}: UseVisitorApprovalsTableColumnsOptions) {
  return useMemo<SmartTableColumn<VisitorPendingEntry>[]>(
    () => [
      {
        id: "visitor",
        header: "Visitor",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{visitorLabel(row.original)}</p>
            <p className="truncate text-muted-foreground text-xs">
              {row.original.visitor?.phone_number || "Phone not set"}
            </p>
          </div>
        ),
      },
      {
        id: "flat",
        header: "Flat",
        cell: ({ row }) => (
          <p className="font-medium text-sm">{visitorFlatLabel(row.original)}</p>
        ),
      },
      {
        id: "resident",
        header: "Primary resident",
        cell: ({ row }) =>
          row.original.primary_resident_name || "Not assigned",
      },
      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
          const purpose = row.original.purpose;
          return (
            <Badge variant="secondary">
              {purpose && purpose in VISITOR_PURPOSE_LABELS
                ? VISITOR_PURPOSE_LABELS[
                    purpose as keyof typeof VISITOR_PURPOSE_LABELS
                  ]
                : titleCaseFromSnake(purpose)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <VisitorSourceBadge source={row.original.source} />,
      },
      {
        accessorKey: "waiting_since",
        header: "Waiting since",
        cell: ({ row }) =>
          formatShortDateIN(
            row.original.waiting_since ?? row.original.created_at,
          ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => {
          const entry = row.original;

          return (
            <div className="flex justify-end gap-1.5">
              <Button
                disabled={!entry.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onView(entry.id ?? null);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Eye className="size-4" />
                View
              </Button>
              {canDecide ? (
                <>
                  <Button
                    disabled={busy || !entry.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onApprove(entry);
                    }}
                    size="sm"
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Approve
                  </Button>
                  <Button
                    disabled={busy || !entry.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onReject(entry);
                    }}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [busy, canDecide, onApprove, onReject, onView],
  );
}
