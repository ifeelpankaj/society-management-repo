import type { ReactNode } from "react";

import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";

type DangerZoneProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DangerZone({
  title = "Danger zone",
  description = "Destructive actions cannot be undone easily. Proceed with care.",
  children,
  className,
}: DangerZoneProps) {
  return (
    <SectionCard
      className={cn("border-destructive/30 bg-destructive/5", className)}
      contentClassName="space-y-3"
      description={description}
      title={<span className="text-destructive">{title}</span>}
    >
      {children}
    </SectionCard>
  );
}
