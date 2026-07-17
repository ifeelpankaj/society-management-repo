import type { ReactNode } from "react";

import { AppLoader } from "@/components/shared/app-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AsyncPanelProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingLabel?: string;
  loadingDescription?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
  className?: string;
};

function AsyncPanel({
  loading,
  error,
  empty,
  loadingLabel = "Loading",
  loadingDescription,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  onRetry,
  children,
  className,
}: AsyncPanelProps) {
  if (loading) {
    return (
      <div className={cn("py-8", className)}>
        <AppLoader description={loadingDescription} label={loadingLabel} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("py-8", className)}>
        <EmptyState
          action={
            onRetry ? (
              <Button onClick={onRetry} type="button" variant="outline">
                Try again
              </Button>
            ) : undefined
          }
          description={error}
          title="Something went wrong"
        />
      </div>
    );
  }

  if (empty) {
    return (
      <div className={cn("py-8", className)}>
        <EmptyState description={emptyDescription} title={emptyTitle} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

export { AsyncPanel, type AsyncPanelProps };
