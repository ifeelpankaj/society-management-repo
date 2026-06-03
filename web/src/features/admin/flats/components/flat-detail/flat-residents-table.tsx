"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SmartTable } from "@/components/tables/smart-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelsFlatResidentResponse } from "@/lib/api/generated-api";

import { residentName } from "./flat-detail-utils";
import { useFlatResidentsTableColumns } from "./flat-residents-table-columns";

type FlatResidentsTableProps = {
  busy: boolean;
  onAddResident: () => void;
  onEditRole: (resident: ModelsFlatResidentResponse) => void;
  onMoveOut: (residentId: number) => void;
  onRefetch: () => void;
  onRemove: (residentId: number) => void;
  onSetPrimary: (residentId: number) => void;
  residents: ModelsFlatResidentResponse[];
  residentsQuery: {
    isError: boolean;
    isLoading: boolean;
  };
};

export function FlatResidentsTable({
  busy,
  onAddResident,
  onEditRole,
  onMoveOut,
  onRefetch,
  onRemove,
  onSetPrimary,
  residents,
  residentsQuery,
}: FlatResidentsTableProps) {
  const [moveOutTarget, setMoveOutTarget] =
    useState<ModelsFlatResidentResponse | null>(null);
  const [removeTarget, setRemoveTarget] =
    useState<ModelsFlatResidentResponse | null>(null);

  const columns = useFlatResidentsTableColumns({
    busy,
    onEditRole,
    onMoveOut: setMoveOutTarget,
    onRemove: setRemoveTarget,
    onSetPrimary,
  });

  return (
    <>
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Residents</CardTitle>
              <CardDescription>
                {residents.length} resident record
                {residents.length === 1 ? "" : "s"} for this flat
              </CardDescription>
            </div>
            <Button onClick={onAddResident} type="button">
              <Plus className="size-4" />
              Add resident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {residentsQuery.isLoading ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
              Loading residents...
            </div>
          ) : residentsQuery.isError ? (
            <EmptyState
              action={
                <Button onClick={onRefetch} type="button">
                  Retry
                </Button>
              }
              description="Refresh the flat and try again."
              title="Could not load residents"
            />
          ) : (
            <SmartTable
              columns={columns}
              data={residents}
              emptyState={
                <EmptyState
                  action={
                    <Button onClick={onAddResident} type="button">
                      <Plus className="size-4" />
                      Add resident
                    </Button>
                  }
                  className="border-0"
                  description="Add an active society member to this flat."
                  title="No residents assigned"
                />
              }
              rowKey={(resident) =>
                resident.id ?? resident.user_id ?? "resident"
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        confirmText="Move out"
        description="The resident will be marked moved out from this flat."
        onConfirm={() => {
          if (moveOutTarget?.id) onMoveOut(moveOutTarget.id);
        }}
        onOpenChange={(open) => {
          if (!open) setMoveOutTarget(null);
        }}
        open={Boolean(moveOutTarget)}
        title={
          moveOutTarget
            ? `Move out ${residentName(moveOutTarget)}?`
            : "Move out resident?"
        }
      />

      <ConfirmDialog
        confirmText="Remove"
        description="This removes the resident from this flat."
        destructive
        onConfirm={() => {
          if (removeTarget?.id) onRemove(removeTarget.id);
        }}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        open={Boolean(removeTarget)}
        title={
          removeTarget
            ? `Remove ${residentName(removeTarget)}?`
            : "Remove resident?"
        }
      />
    </>
  );
}
