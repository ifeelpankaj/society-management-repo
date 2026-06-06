import { SectionCard } from "@/components/shared/section-card";
import { formatShortDateIN } from "@/lib/format";

export type TimelineItem = {
  id: string;
  label: string;
  value?: string | null;
};

type TimelineCardProps = {
  title?: string;
  description?: string;
  items: TimelineItem[];
};

export function TimelineCard({
  title = "Timeline",
  description = "Key dates for this record.",
  items,
}: TimelineCardProps) {
  return (
    <SectionCard description={description} title={title}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5"
            key={item.id}
          >
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              {item.label}
            </dt>
            <dd className="mt-1 font-medium text-sm">
              {formatShortDateIN(item.value ?? undefined, "Not set")}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
