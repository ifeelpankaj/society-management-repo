import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
};

function SectionCard({
  title,
  description,
  actions,
  children,
  footer,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card data-slot="section-card" className={className}>
      {title || description || actions ? (
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {actions}
            </div>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent
        className={cn(!title && !description && "pt-6", contentClassName)}
      >
        {children}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}

export { SectionCard, type SectionCardProps };
