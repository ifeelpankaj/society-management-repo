import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import {
  eyebrowVariants,
  pageDescriptionVariants,
  pageTitleVariants,
} from "@/lib/styles/app-variants";
import { pageHeaderVariants } from "@/lib/styles/layout-variants";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  size?: VariantProps<typeof pageTitleVariants>["size"];
  align?: VariantProps<typeof pageHeaderVariants>["align"];
  showDivider?: boolean;
};

function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  size,
  align = "left",
  showDivider,
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(pageHeaderVariants({ align, showDivider }), className)}
    >
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
          align === "center" && "sm:flex-col sm:items-center",
        )}
      >
        <div className="min-w-0 space-y-2">
          {eyebrow ? <p className={eyebrowVariants()}>{eyebrow}</p> : null}
          <h1 className={pageTitleVariants({ size })}>{title}</h1>
          {description ? (
            <p className={pageDescriptionVariants({ align })}>{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div
            className={cn(
              "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center",
              align === "center" && "sm:justify-center",
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { PageHeader };
