"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UI_DEFAULTS } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type SmartTableColumnMeta = {
  className?: string;
  headerClassName?: string;
};

type SmartTableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>;

type SmartTableProps<TData> = {
  columns: SmartTableColumn<TData>[];
  data: TData[];
  loading?: boolean;
  emptyState?: ReactNode;
  rowKey: keyof TData | ((row: TData, index: number) => string | number);
  onRowClick?: (row: TData) => void;
  className?: string;
  skeletonRows?: number;
  virtualizeAfter?: number;
  maxHeight?: number;
};

function getRowKey<TData>(
  row: TData,
  index: number,
  rowKey: SmartTableProps<TData>["rowKey"],
) {
  if (typeof rowKey === "function") {
    return String(rowKey(row, index));
  }

  return String(row[rowKey]);
}

function getColumnMeta(meta: unknown): SmartTableColumnMeta | undefined {
  return meta as SmartTableColumnMeta | undefined;
}

function SmartTable<TData>({
  columns,
  data,
  loading,
  emptyState,
  rowKey,
  onRowClick,
  className,
  skeletonRows = UI_DEFAULTS.tableSkeletonRows,
  virtualizeAfter = 50,
  maxHeight = 640,
}: SmartTableProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => getRowKey(row, index, rowKey),
  });
  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;
  const shouldVirtualize = !loading && rows.length >= virtualizeAfter;
  const skeletonRowKeys = Array.from(
    { length: skeletonRows },
    (_, rowIndex) => `skeleton-row-${rowIndex + 1}`,
  );

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const renderRow = (row: (typeof rows)[number]) => (
    <TableRow
      key={row.id}
      className={cn(onRowClick && "cursor-pointer")}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={getColumnMeta(cell.column.columnDef.meta)?.className}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div
      data-slot="smart-table"
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      <div
        ref={parentRef}
        className={cn(shouldVirtualize && "overflow-auto")}
        style={shouldVirtualize ? { maxHeight } : undefined}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      getColumnMeta(header.column.columnDef.meta)?.headerClassName
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading
              ? skeletonRowKeys.map((skeletonKey) => (
                  <TableRow key={skeletonKey}>
                    {table.getAllLeafColumns().map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-4 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : shouldVirtualize
                ? (
                    <>
                      {virtualRows.length > 0 ? (
                        <TableRow style={{ height: virtualRows[0]?.start ?? 0 }}>
                          <TableCell colSpan={columns.length} className="p-0" />
                        </TableRow>
                      ) : null}
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) {
                          return null;
                        }
                        return renderRow(row);
                      })}
                      {virtualRows.length > 0 ? (
                        <TableRow
                          style={{
                            height:
                              rowVirtualizer.getTotalSize() -
                              (virtualRows[virtualRows.length - 1]?.end ?? 0),
                          }}
                        >
                          <TableCell colSpan={columns.length} className="p-0" />
                        </TableRow>
                      ) : null}
                    </>
                  )
                : rows.map((row) => renderRow(row))}
          </TableBody>
        </Table>
      </div>

      {!loading && !hasRows ? (
        <div className="border-t border-border p-4">
          {emptyState ?? <EmptyState className="border-0" />}
        </div>
      ) : null}
    </div>
  );
}

export { SmartTable, type SmartTableColumn, type SmartTableProps };
