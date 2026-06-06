import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { titleCaseFromSnake } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatusHeroProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  status?: string | null;
  statusVariant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
};

export function StatusHero({
  icon,
  title,
  description,
  status,
  statusVariant = "secondary",
  className,
}: StatusHeroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      </div>
      {status ? (
        <Badge className="shrink-0 self-start" variant={statusVariant}>
          {titleCaseFromSnake(status)}
        </Badge>
      ) : null}
    </div>
  );
}
