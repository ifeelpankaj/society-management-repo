"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-border border-t pt-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
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
