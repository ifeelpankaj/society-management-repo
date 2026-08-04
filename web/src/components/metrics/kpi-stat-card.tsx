import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type KpiStatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "default" | "emerald" | "amber" | "rose" | "sky";
  loading?: boolean;
  className?: string;
};

const accentRing: Record<NonNullable<KpiStatCardProps["accent"]>, string> = {
  default: "from-primary/15 via-transparent to-transparent",
  emerald: "from-emerald-500/20 via-transparent to-transparent",
  amber: "from-amber-500/20 via-transparent to-transparent",
  rose: "from-rose-500/20 via-transparent to-transparent",
  sky: "from-sky-500/20 via-transparent to-transparent",
};

export function KpiStatCard({
  label,
  value,
  hint,
  icon,
  accent = "default",
  loading,
  className,
}: KpiStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-xs",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accentRing[accent],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] text-muted-foreground uppercase tracking-[0.14em]">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-semibold text-3xl tabular-nums tracking-tight">
              {value}
            </p>
          )}
          {hint ? (
            <p className="truncate text-muted-foreground text-xs">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
