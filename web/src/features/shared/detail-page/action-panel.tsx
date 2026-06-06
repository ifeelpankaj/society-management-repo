import type { ReactNode } from "react";

import { SectionCard } from "@/components/shared/section-card";

type ActionPanelProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function ActionPanel({
  title,
  description,
  children,
}: ActionPanelProps) {
  return (
    <SectionCard description={description} title={title}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {children}
      </div>
    </SectionCard>
  );
}
