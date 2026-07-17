import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
};

function FormSection({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {title || description ? (
        <div className="space-y-2">
          {title ? (
            <h2 className="font-semibold text-2xl text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={cn("space-y-4", contentClassName)}>{children}</div>

      {footer ? <div className="pt-1">{footer}</div> : null}
    </section>
  );
}

export { FormSection, type FormSectionProps };
