import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MetricTileTone = "neutral" | "success" | "warning" | "danger";

type MetricTileProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: MetricTileTone;
  loading?: boolean;
  className?: string;
};

const toneClasses: Record<MetricTileTone, string> = {
  neutral: "border-border/70 bg-card/80",
  success: "border-emerald-500/30 bg-emerald-500/5",
  warning: "border-amber-500/35 bg-amber-500/5",
  danger: "border-destructive/35 bg-destructive/5",
};

export function MetricTile({
  label,
  value,
  icon,
  tone = "neutral",
  loading,
  className,
}: MetricTileProps) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
        toneClasses[tone],
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[0.68rem] text-muted-foreground uppercase tracking-[0.12em]">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-1.5 h-5 w-12" />
        ) : (
          <p className="mt-0.5 font-semibold text-lg tabular-nums tracking-tight">
            {value}
          </p>
        )}
      </div>
      {icon ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background/70 text-muted-foreground">
          {icon}
        </div>
      ) : null}
    </div>
  );
}
