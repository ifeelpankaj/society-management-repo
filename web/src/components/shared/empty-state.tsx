import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { UI_DEFAULTS } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function EmptyState({
  icon,
  title = UI_DEFAULTS.emptyStateTitle,
  description = UI_DEFAULTS.emptyStateDescription,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full border border-border bg-muted p-3 text-muted-foreground">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-muted-foreground text-sm leading-6">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
