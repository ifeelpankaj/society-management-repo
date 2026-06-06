import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageLayoutProps = {
  summary?: ReactNode;
  main?: ReactNode;
  sidebar?: ReactNode;
  actions?: ReactNode;
  danger?: ReactNode;
  className?: string;
};

export function DetailPageLayout({
  summary,
  main,
  sidebar,
  actions,
  danger,
  className,
}: DetailPageLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {summary ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {summary}
          {sidebar}
        </section>
      ) : null}
      {main}
      {actions}
      {danger}
    </div>
  );
}
