import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatGridProps = {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 6;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
} as const;

function StatGrid({ children, className, columns = 4 }: StatGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        columnClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}

export { StatGrid, type StatGridProps };
