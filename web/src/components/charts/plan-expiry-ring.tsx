"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumberIN, formatShortDateIN } from "@/lib/format";
import { computePlanPeriodProgress } from "@/lib/subscription-health";
import { cn } from "@/lib/utils";

type PlanExpiryRingProps = {
  startsAt?: string | null;
  endsAt?: string | null;
  daysUntilExpiry?: number | null;
  isExpiringSoon?: boolean;
  isActive?: boolean;
  className?: string;
};

export function PlanExpiryRing({
  startsAt,
  endsAt,
  daysUntilExpiry,
  isExpiringSoon,
  isActive,
  className,
}: PlanExpiryRingProps) {
  const progress = computePlanPeriodProgress(startsAt, endsAt);

  const chartConfig = {
    elapsed: { label: "Elapsed", color: "var(--chart-4)" },
    remaining: { label: "Remaining", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  if (!progress) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 text-center", className)}>
        <p className="font-semibold text-2xl">—</p>
        <p className="text-muted-foreground text-xs">End date not set</p>
      </div>
    );
  }

  const chartData = [
    { key: "elapsed", value: progress.elapsedPercent, fill: "var(--color-elapsed)" },
    { key: "remaining", value: progress.remainingPercent, fill: "var(--color-remaining)" },
  ].filter((item) => item.value > 0);

  const ringColor = !isActive
    ? "text-destructive"
    : isExpiringSoon
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <ChartContainer config={chartConfig} className="aspect-square h-36 w-36">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="key"
            innerRadius={48}
            outerRadius={64}
            strokeWidth={4}
            stroke="var(--background)"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="text-center">
        <p className={cn("font-semibold text-2xl tabular-nums", ringColor)}>
          {daysUntilExpiry != null
            ? formatNumberIN(daysUntilExpiry)
            : formatNumberIN(progress.remainingDays)}
        </p>
        <p className="text-muted-foreground text-xs">
          day{(daysUntilExpiry ?? progress.remainingDays) === 1 ? "" : "s"} remaining
        </p>
        {endsAt ? (
          <p className="mt-1 text-muted-foreground text-xs">
            Expires {formatShortDateIN(endsAt, "Not set")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
