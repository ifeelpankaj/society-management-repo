"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { SmartTable } from "@/components/tables/smart-table";
import type { ModelsFlatResponse } from "@/lib/api/generated-api";

import { useFlatsTableColumns } from "./flats-table-columns";

type FlatsTableProps = {
  actionInProgress: boolean;
  flats: ModelsFlatResponse[];
  loading?: boolean;
};

export function FlatsTable({
  actionInProgress,
  flats,
  loading,
}: FlatsTableProps) {
  const columns = useFlatsTableColumns({
    actionInProgress,
  });

  return (
    <SmartTable
      columns={columns}
      data={flats}
      emptyState={
        <EmptyState
          className="border-0"
          description="Try changing the search or filters."
          title="No flats in this view"
        />
      }
      loading={loading}
      rowKey={(flat) => flat.id ?? flat.flat_number ?? "flat"}
    />
  );
}
