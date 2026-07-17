import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { pageShellVariants } from "@/lib/styles/layout-variants";
import { cn } from "@/lib/utils";

type PageShellProps = ComponentProps<"main"> &
  VariantProps<typeof pageShellVariants>;

function PageShell({ className, size, background, ...props }: PageShellProps) {
  return (
    <main
      data-slot="page-shell"
      className={cn(pageShellVariants({ size, background }), className)}
      {...props}
    />
  );
}

export { PageShell };
