"use client";

import { Eye } from "lucide-react";
import { useMemo } from "react";

import type { SmartTableColumn } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlatStatusBadge } from "@/features/admin/flats/components/flat-status-badge";
import type { ModelsFlatResponse } from "@/lib/api/generated-api";
import { formatShortDateIN } from "@/lib/format";
import { useRouter } from "next/navigation";

export function flatLabel(flat: ModelsFlatResponse) {
  return flat.flat_number ?? `Flat #${flat.id}`;
}

type UseFlatsTableColumnsOptions = {
  actionInProgress: boolean;
  onBlockToggle: (flat: ModelsFlatResponse) => void;
  onDeactivate: (flat: ModelsFlatResponse) => void;
  onEdit: (flat: ModelsFlatResponse) => void;
};

export function useFlatsTableColumns({
  actionInProgress,
  onBlockToggle,
  onDeactivate,
  onEdit,
}: UseFlatsTableColumnsOptions) {
  const router = useRouter();
  const handleDetails = (flat: ModelsFlatResponse) => {
    router.push(`flats/${flat.id}`);
  };
  return useMemo<SmartTableColumn<ModelsFlatResponse>[]>(
    () => [
      {
        accessorKey: "flat_number",
        header: "Flat number",
        cell: ({ row }) => (
          <span className="font-medium">{flatLabel(row.original)}</span>
        ),
      },
      {
        accessorKey: "block",
        header: "Block",
        cell: ({ row }) => row.original.block || "Not set",
      },
      {
        accessorKey: "floor",
        header: "Floor",
        cell: ({ row }) => row.original.floor || "Not set",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <FlatStatusBadge status={row.original.status} />,
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <Badge
            variant={row.original.is_active === false ? "outline" : "default"}
          >
            {row.original.is_active === false ? "Inactive" : "Active"}
          </Badge>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Last updated",
        cell: ({ row }) =>
          formatShortDateIN(row.original.updated_at, "Not updated"),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => {
          const flat = row.original;

          return (
            <div className="flex justify-end">
              <Button
                aria-label={`Details ${flatLabel(flat)}`}
                disabled={!flat.id || actionInProgress}
                onClick={() => handleDetails(flat)}
                size="icon-sm"
                title="Flat Details"
                type="button"
                variant="ghost"
              >
                <Eye className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [actionInProgress, onBlockToggle, onDeactivate, onEdit],
  );
}
