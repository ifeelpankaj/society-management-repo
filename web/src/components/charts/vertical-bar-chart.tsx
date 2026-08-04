"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumberIN } from "@/lib/format";

export type VerticalBarChartItem = {
  key: string;
  label: string;
  value: number;
};

type VerticalBarChartProps = {
  data: VerticalBarChartItem[];
  className?: string;
};

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function VerticalBarChart({ data, className }: VerticalBarChartProps) {
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
    value: item.value,
    fill: chartColors[index % chartColors.length],
  }));

  const hasData = chartData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground text-sm">
        No data to chart
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className={className ?? "aspect-[4/3] max-h-[280px] w-full"}>
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => formatNumberIN(v)} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={88}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
        <Bar dataKey="value" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
