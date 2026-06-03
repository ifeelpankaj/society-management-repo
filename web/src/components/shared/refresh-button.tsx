"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RefreshButtonProps = {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  className?: string;
};

function RefreshButton({
  onClick,
  loading,
  label = "Refresh",
  className,
}: RefreshButtonProps) {
  return (
    <Button
      className={className}
      disabled={loading}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
      {label}
    </Button>
  );
}

export { RefreshButton, type RefreshButtonProps };
