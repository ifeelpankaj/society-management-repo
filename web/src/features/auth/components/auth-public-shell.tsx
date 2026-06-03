import type { ReactNode } from "react";

import { PageShell } from "@/components/shared/page-shell";
import { cn } from "@/lib/utils";

import { RouteGuard } from "./route-guard";

type AuthPublicShellProps = {
  hero: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthPublicShell({
  hero,
  children,
  className,
}: AuthPublicShellProps) {
  return (
    <RouteGuard mode="publicOnly">
      <PageShell
        size="full"
        background="premium"
        className={cn("min-h-[calc(100vh-4rem)] gap-0 px-0 py-0", className)}
      >
        <main className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="flex min-w-0 items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-12 xl:px-16">
            <div className="w-full">{hero}</div>
          </section>
          <section className="flex min-w-0 items-center justify-center border-border/70 border-t bg-card/24 px-4 py-8 backdrop-blur-sm sm:px-6 sm:py-10 lg:border-t-0 lg:border-l lg:px-12 xl:px-16">
            <div className="w-full max-w-xl">{children}</div>
          </section>
        </main>
      </PageShell>
    </RouteGuard>
  );
}
