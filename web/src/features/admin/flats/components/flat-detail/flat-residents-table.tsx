"use client";

import { Plus } from "lucide-react";

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

import { useFlatResidentsTableColumns } from "./flat-residents-table-columns";

type FlatResidentsTableProps = {
  buildResidentDetailHref: (residentId: number) => string;
  onAddResident?: () => void;
  readOnly?: boolean;
  residents: ModelsFlatResidentResponse[];
  residentsQuery: {
    isError: boolean;
    isLoading: boolean;
  };
  onRefetch: () => void;
};

export function FlatResidentsTable({
  buildResidentDetailHref,
  onAddResident,
  readOnly = false,
  residents,
  residentsQuery,
  onRefetch,
}: FlatResidentsTableProps) {
  const columns = useFlatResidentsTableColumns({ buildResidentDetailHref });

  return (
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
          {!readOnly && onAddResident ? (
            <Button onClick={onAddResident} type="button">
              <Plus className="size-4" />
              Add resident
            </Button>
          ) : null}
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
                  !readOnly && onAddResident ? (
                    <Button onClick={onAddResident} type="button">
                      <Plus className="size-4" />
                      Add resident
                    </Button>
                  ) : undefined
                }
                className="border-0"
                description={
                  readOnly
                    ? "No residents are assigned to this flat."
                    : "Add an active society member to this flat."
                }
                title="No residents assigned"
              />
            }
            rowKey={(resident) => resident.id ?? resident.user_id ?? "resident"}
          />
        )}
      </CardContent>
    </Card>
  );
}
