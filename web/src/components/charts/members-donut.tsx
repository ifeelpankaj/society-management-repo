"use client";

import { DonutChart, type DonutChartItem } from "@/components/charts/donut-chart";

type MembersDonutProps = {
  owners?: number;
  admins?: number;
  staff?: number;
  residents?: number;
  className?: string;
};

export function MembersDonut({
  owners = 0,
  admins = 0,
  staff = 0,
  residents = 0,
  className,
}: MembersDonutProps) {
  const data: DonutChartItem[] = [
    { key: "owners", label: "Owners", value: owners, color: "var(--chart-1)" },
    { key: "admins", label: "Admins", value: admins, color: "var(--chart-2)" },
    { key: "staff", label: "Staff", value: staff, color: "var(--chart-3)" },
    { key: "residents", label: "Residents", value: residents, color: "var(--chart-4)" },
  ];

  const total = owners + admins + staff + residents;

  return (
    <DonutChart
      centerLabel="Members"
      centerValue={total}
      className={className}
      data={data}
    />
  );
}
