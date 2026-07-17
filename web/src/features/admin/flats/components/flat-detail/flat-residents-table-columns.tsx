"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { RoleBadge } from "@/components/shared/role-badge";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isRoleKey } from "@/features/auth/profile/profile-utils";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";

import { residentName } from "./flat-detail-utils";

type UseFlatResidentsTableColumnsOptions = {
  buildResidentDetailHref: (residentId: number) => string;
};

export function useFlatResidentsTableColumns({
  buildResidentDetailHref,
}: UseFlatResidentsTableColumnsOptions) {
  return useMemo<SmartTableColumn<ModelsFlatResidentResponse>[]>(
    () => [
      {
        id: "resident",
        header: "Resident",
        cell: ({ row }) => {
          const resident = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{residentName(resident)}</p>
                {resident.is_primary ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground text-xs">
                User #{resident.user_id ?? "unknown"}
              </p>
            </div>
          );
        },
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
        id: "role",
        header: "Role",
        cell: ({ row }) =>
          isRoleKey(row.original.role) ? (
            <RoleBadge role={row.original.role} />
          ) : (
            <Badge variant="secondary">
              {titleCaseFromSnake(row.original.role)}
            </Badge>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "active" ? "default" : "outline"}
          >
            {titleCaseFromSnake(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "moved_in",
        header: "Moved in",
        cell: ({ row }) =>
          formatShortDateIN(row.original.moved_in_at, "Not set"),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { headerClassName: "text-right", className: "text-right" },
        cell: ({ row }) => {
          const resident = row.original;
          if (!resident.id) {
            return null;
          }
          return (
            <div className="flex justify-end">
              <Button asChild size="sm" type="button" variant="outline">
                <Link href={buildResidentDetailHref(resident.id)}>
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [buildResidentDetailHref],
  );
}
