import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type KeyValueItem = {
  id?: string;
  label: ReactNode;
  value: ReactNode;
};

type KeyValueGridProps = {
  items: KeyValueItem[];
  className?: string;
  columns?: 1 | 2;
};

function KeyValueGrid({ items, className, columns = 2 }: KeyValueGridProps) {
  return (
    <dl
      className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2", className)}
    >
      {items.map((item) => (
        <div className="space-y-1" key={item.id ?? String(item.label)}>
          <dt className="text-muted-foreground text-sm">{item.label}</dt>
          <dd className="font-medium text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { KeyValueGrid, type KeyValueGridProps, type KeyValueItem };
