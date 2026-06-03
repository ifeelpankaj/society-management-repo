"use client";

import { Crown, LogOut, Trash2, UserCog } from "lucide-react";
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
  busy: boolean;
  onEditRole: (resident: ModelsFlatResidentResponse) => void;
  onMoveOut: (resident: ModelsFlatResidentResponse) => void;
  onRemove: (resident: ModelsFlatResidentResponse) => void;
  onSetPrimary: (residentId: number) => void;
};

export function useFlatResidentsTableColumns({
  busy,
  onEditRole,
  onMoveOut,
  onRemove,
  onSetPrimary,
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
                  <Badge variant="secondary">
                    <Crown className="size-3" />
                    Primary
                  </Badge>
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
          const active = resident.status === "active";
          return (
            <div className="flex justify-end gap-1.5">
              <Button
                disabled={!resident.id || !active || busy}
                onClick={() => onEditRole(resident)}
                size="icon-sm"
                title="Update resident role"
                type="button"
                variant="outline"
              >
                <UserCog className="size-4" />
              </Button>
              <Button
                disabled={
                  !resident.id || !active || resident.is_primary || busy
                }
                onClick={() => onSetPrimary(resident.id ?? 0)}
                size="icon-sm"
                title="Set primary resident"
                type="button"
                variant="outline"
              >
                <Crown className="size-4" />
              </Button>
              <Button
                disabled={!resident.id || !active || busy}
                onClick={() => onMoveOut(resident)}
                size="icon-sm"
                title="Move out resident"
                type="button"
                variant="outline"
              >
                <LogOut className="size-4" />
              </Button>
              <Button
                disabled={!resident.id || !active || busy}
                onClick={() => onRemove(resident)}
                size="icon-sm"
                title="Remove resident"
                type="button"
                variant="destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [busy, onEditRole, onMoveOut, onRemove, onSetPrimary],
  );
}
