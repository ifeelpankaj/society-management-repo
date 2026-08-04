import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricTileGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
  6: "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
} as const;

export function MetricTileGrid({
  children,
  className,
  columns = 6,
}: MetricTileGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2",
        columnClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
