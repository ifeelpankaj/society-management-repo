import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DetailsDialogItem = {
  label: ReactNode;
  value: ReactNode;
};

type DetailsDialogProps = {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  items?: DetailsDialogItem[];
  children?: ReactNode;
  className?: string;
};

function DetailsDialog({
  trigger,
  title,
  description,
  items,
  children,
  className,
}: DetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {items?.length ? (
          <dl className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
            {items.map((item, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: detail rows are static for each dialog render
                key={index}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="min-w-0 text-right font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

export { DetailsDialog, type DetailsDialogItem, type DetailsDialogProps };
