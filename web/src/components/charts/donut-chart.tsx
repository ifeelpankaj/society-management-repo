"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumberIN } from "@/lib/format";

export type DonutChartItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DonutChartItem[];
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
};

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const filtered = data.filter((item) => item.value > 0);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = filtered.reduce<ChartConfig>((acc, item) => {
    acc[item.key] = { label: item.label, color: item.color };
    return acc;
  }, {});

  if (total === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground text-sm">
        No data to chart
      </div>
    );
  }

  const chartData = filtered.map((item) => ({
    key: item.key,
    label: item.label,
    value: item.value,
    fill: `var(--color-${item.key})`,
  }));

  return (
    <ChartContainer config={chartConfig} className={className ?? "mx-auto aspect-square max-h-[280px]"}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="key"
          innerRadius={68}
          outerRadius={96}
          strokeWidth={4}
          stroke="var(--background)"
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} className={`fill-${entry.key}`} fill={entry.fill} />
          ))}
          {centerLabel || centerValue != null ? (
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {centerValue != null ? (
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground font-semibold text-2xl"
                        >
                          {typeof centerValue === "number"
                            ? formatNumberIN(centerValue)
                            : centerValue}
                        </tspan>
                      ) : null}
                      {centerLabel ? (
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      ) : null}
                    </text>
                  );
                }
                return null;
              }}
            />
          ) : null}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
