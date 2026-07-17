"use client";

import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  label?: string;
};

export function FilterPanel({
  children,
  className,
  defaultOpen = false,
  label = "More filters",
}: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        size="sm"
        type="button"
        variant="outline"
      >
        <SlidersHorizontal className="size-4" />
        {label}
      </Button>
      {open ? (
        <div className="grid gap-3 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
