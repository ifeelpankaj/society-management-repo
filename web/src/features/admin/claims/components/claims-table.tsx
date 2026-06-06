"use client";

import { PaginationFooter } from "@/components/data/pagination-footer";
import type { SmartTableColumn } from "@/components/tables/smart-table";
import { SmartTable } from "@/components/tables/smart-table";
import type { ModelsFlatClaimResponse } from "@/lib/api/generated-api";

type ClaimsTableProps = {
  claims: ModelsFlatClaimResponse[];
  columns: SmartTableColumn<ModelsFlatClaimResponse>[];
  isFetching: boolean;
  onRowClick: (claim: ModelsFlatClaimResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function ClaimsTable({
  claims,
  columns,
  isFetching,
  onRowClick,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  totalItems,
  totalPages,
}: ClaimsTableProps) {
  return (
    <div className="space-y-4">
      <SmartTable
        columns={columns}
        data={claims}
        onRowClick={onRowClick}
        rowKey={(claim) => claim.id ?? "claim"}
      />
      <PaginationFooter
        loading={isFetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
}
