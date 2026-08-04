import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  action?: ReactNode;
};

export function ChartPanel({
  title,
  description,
  children,
  className,
  empty,
  emptyTitle = "No data yet",
  emptyDescription = "Metrics will appear here once available.",
  action,
}: ChartPanelProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState
            className="min-h-48 border-0"
            description={emptyDescription}
            title={emptyTitle}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
