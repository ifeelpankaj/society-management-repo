"use client";

import { Ban, CheckCircle2, Pencil, Trash2 } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlatStatusBadge } from "@/features/admin/flats/components/flat-status-badge";
import type { ModelsFlatResponse } from "@/lib/api/generated-api";

import { flatLabel } from "./flat-detail-utils";

type FlatDetailHeaderProps = {
  busy: boolean;
  flat: ModelsFlatResponse;
  flatsHref: string;
  backLabel?: string;
  isFetching: boolean;
  onDeactivate: () => void;
  onEdit: () => void;
  onBlockToggle: () => void;
  onRefetch: () => void;
  readOnly?: boolean;
};

export function FlatDetailHeader({
  busy,
  flat,
  flatsHref,
  backLabel = "Back to flats",
  isFetching,
  onDeactivate,
  onEdit,
  onBlockToggle,
  onRefetch,
  readOnly = false,
}: FlatDetailHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-3">
        <BackLink href={flatsHref} label={backLabel} />
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            Flat details
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-semibold text-3xl tracking-tight">
              {flatLabel(flat)}
            </h1>
            <FlatStatusBadge status={flat.status} />
            <Badge variant={flat.is_active === false ? "outline" : "default"}>
              {flat.is_active === false ? "Inactive" : "Active"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <RefreshButton loading={isFetching} onClick={onRefetch} />
        {!readOnly ? (
          <>
            <Button disabled={busy} onClick={onEdit} variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button disabled={busy} onClick={onBlockToggle} variant="outline">
              {flat.status === "blocked" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Ban className="size-4" />
              )}
              {flat.status === "blocked" ? "Unblock" : "Block"}
            </Button>
            <Button
              disabled={busy}
              onClick={onDeactivate}
              variant="destructive"
            >
              <Trash2 className="size-4" />
              Deactivate
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}
