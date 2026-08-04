"use client";

import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  buildDashboardActionItems,
  type DashboardActionItem,
} from "../utils/dashboard-action-items";
import type { SocietyDashboardBootstrap } from "@/lib/api/society-dashboard-api";

type DashboardActionCenterProps = {
  dashboard: SocietyDashboardBootstrap;
  societyId: number;
};

const severityStyles = {
  danger: "text-destructive",
  warning: "text-amber-600",
  info: "text-muted-foreground",
} as const;

function ActionRow({ item }: { item: DashboardActionItem }) {
  const content = (
    <div className="flex items-start gap-2 py-2 text-sm">
      <AlertTriangle
        className={cn("mt-0.5 size-4 shrink-0", severityStyles[item.severity])}
      />
      <span>{item.message}</span>
    </div>
  );

  if (item.href) {
    return (
      <Link className="block rounded-md px-2 transition-colors hover:bg-muted/60" href={item.href}>
        {content}
      </Link>
    );
  }

  return <div className="px-2">{content}</div>;
}

export function DashboardActionCenter({
  dashboard,
  societyId,
}: DashboardActionCenterProps) {
  const [expanded, setExpanded] = useState(false);
  const items = useMemo(
    () => buildDashboardActionItems(dashboard, societyId),
    [dashboard, societyId],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span className="font-medium">All clear — nothing needs your attention</span>
        </div>
      </div>
    );
  }

  const visible = expanded ? items : items.slice(0, 3);

  return (
    <section className="rounded-xl border border-border/80 bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3 border-border/70 border-b pb-3">
        <div>
          <p className="font-semibold text-sm">Attention required</p>
          <p className="text-muted-foreground text-xs">
            {items.length} item{items.length === 1 ? "" : "s"} need review
          </p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-700 text-xs tabular-nums dark:text-amber-300">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-border/60">
        {visible.map((item) => (
          <ActionRow item={item} key={item.id} />
        ))}
      </div>
      {items.length > 3 ? (
        <Button
          className="mt-2 w-full"
          onClick={() => setExpanded((value) => !value)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Show less" : `Show ${items.length - 3} more`}
        </Button>
      ) : null}
    </section>
  );
}
