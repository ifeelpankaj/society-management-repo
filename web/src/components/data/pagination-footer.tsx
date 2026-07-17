"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { FilterSelect } from "@/components/forms/filter-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationFooterProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading?: boolean;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

function PaginationFooter({
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationFooterProps) {
  const pageStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-border border-t pt-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span>
          Showing {pageStart}–{pageEnd} of {totalItems}
        </span>
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <FilterSelect
              className="w-20"
              onChange={(event) =>
                onPageSizeChange(Number.parseInt(event.target.value, 10))
              }
              options={pageSizeOptions.map((size) => ({
                label: String(size),
                value: String(size),
              }))}
              value={String(pageSize)}
            />
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          type="button"
          variant="outline"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export { PaginationFooter, type PaginationFooterProps };
