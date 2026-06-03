import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListToolbarProps = {
  children: ReactNode;
  className?: string;
};

function ListToolbar({ children, className }: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { ListToolbar, type ListToolbarProps };
