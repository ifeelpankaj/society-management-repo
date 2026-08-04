"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumberIN } from "@/lib/format";

export type DailyBarChartItem = {
  date: string;
  count: number;
};

type DailyBarChartProps = {
  data: DailyBarChartItem[];
  className?: string;
};

const chartConfig = {
  count: { label: "Visitors", color: "var(--chart-2)" },
} satisfies ChartConfig;

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", { weekday: "short" });
}

export function DailyBarChart({ data, className }: DailyBarChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatDayLabel(item.date),
  }));

  if (chartData.every((item) => item.count === 0)) {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground text-sm">
        No visitor activity in this period
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={className ?? "aspect-[5/3] max-h-[260px] w-full"}
    >
      <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
          tickFormatter={(v) => formatNumberIN(v)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as DailyBarChartItem | undefined;
                return item?.date ?? "";
              }}
            />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
