import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardCardVariants } from "@/lib/styles/card-variants";
import { cn } from "@/lib/utils";

type DashboardCardTrend = {
  value: string;
  direction?: "up" | "down" | "neutral";
  label?: string;
};

type DashboardCardProps = {
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trend?: DashboardCardTrend;
  loading?: boolean;
  className?: string;
  size?: "default" | "sm";
};

function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  loading,
  className,
  size = "default",
}: DashboardCardProps) {
  const trendIcon =
    trend?.direction === "up" ? (
      <TrendingUp className="size-3.5" />
    ) : trend?.direction === "down" ? (
      <TrendingDown className="size-3.5" />
    ) : null;

  return (
    <Card
      data-slot="dashboard-card"
      className={cn(dashboardCardVariants({ loading }), className)}
    >
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        {icon ? (
          <div className="rounded-md border border-border bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <>
            <div
              className={cn(
                "font-semibold tracking-normal",
                size === "sm" ? "text-2xl" : "text-3xl",
              )}
            >
              {value}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {trend ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium",
                    trend.direction === "up" &&
                      "text-emerald-700 dark:text-emerald-300",
                    trend.direction === "down" &&
                      "text-destructive dark:text-red-300",
                    trend.direction === "neutral" && "text-muted-foreground",
                  )}
                >
                  {trendIcon}
                  {trend.value}
                </span>
              ) : null}
              {description ? (
                <CardDescription>
                  {trend?.label ? trend.label : description}
                </CardDescription>
              ) : trend?.label ? (
                <CardDescription>{trend.label}</CardDescription>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { DashboardCard, type DashboardCardTrend };
