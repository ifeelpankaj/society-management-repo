"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumberIN } from "@/lib/format";

export type HorizontalBarChartItem = {
  key: string;
  label: string;
  used: number;
  limit?: number;
  percent?: number;
};

type HorizontalBarChartProps = {
  data: HorizontalBarChartItem[];
  className?: string;
};

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function HorizontalBarChart({ data, className }: HorizontalBarChartProps) {
  const chartConfig = data.reduce<ChartConfig>((acc, item, index) => {
    acc[item.key] = {
      label: item.label,
      color: chartColors[index % chartColors.length],
    };
    return acc;
  }, {});

  const chartData = data.map((item, index) => ({
    key: item.key,
    label: item.label,
    used: item.used,
    limit: item.limit ?? item.used,
    fill: chartColors[index % chartColors.length],
  }));

  const hasData = chartData.some((item) => item.limit > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground text-sm">
        No quota data to chart
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className={className ?? "aspect-[4/3] max-h-[280px] w-full"}>
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} domain={[0, "dataMax"]} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={72}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="key"
              formatter={(value, _name, item) => {
                const payload = item.payload as { used: number; limit: number };
                return (
                  <div className="flex flex-1 justify-between gap-4 leading-none">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatNumberIN(payload.used)} / {formatNumberIN(payload.limit)}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Bar dataKey="used" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
