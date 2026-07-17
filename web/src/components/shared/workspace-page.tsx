import type { ReactNode } from "react";

import { PageShell } from "@/components/shared/page-shell";
import { cn } from "@/lib/utils";

type WorkspacePageSize = "default" | "wide" | "narrow" | "wizard" | "form";

type WorkspacePageProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  size?: WorkspacePageSize;
};

const widthClassName: Record<WorkspacePageSize, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-5xl",
  wizard: "max-w-4xl",
  form: "max-w-3xl",
};

export function WorkspacePage({
  children,
  className,
  mainClassName,
  size = "default",
}: WorkspacePageProps) {
  return (
    <PageShell
      background="default"
      className={cn("min-h-full py-8", className)}
    >
      <main
        className={cn(
          "mx-auto w-full space-y-6",
          widthClassName[size],
          mainClassName,
        )}
      >
        {children}
      </main>
    </PageShell>
  );
}

export type { WorkspacePageSize };
