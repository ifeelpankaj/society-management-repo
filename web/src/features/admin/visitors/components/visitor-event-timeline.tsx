import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import type { VisitorEntryEvent } from "@/lib/api/visitor-types";
import { formatShortDateIN, titleCaseFromSnake } from "@/lib/format";

type VisitorEventTimelineProps = {
  events: VisitorEntryEvent[];
  loading?: boolean;
};

function sortEventsChronologically(events: VisitorEntryEvent[]) {
  return [...events].sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at
      ? new Date(right.created_at).getTime()
      : 0;
    return leftTime - rightTime;
  });
}

export function VisitorEventTimeline({
  events,
  loading = false,
}: VisitorEventTimelineProps) {
  const sortedEvents = sortEventsChronologically(events);

  return (
    <SectionCard
      description="Chronological activity for this visitor entry"
      title="Event timeline"
    >
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading events...</p>
      ) : sortedEvents.length > 0 ? (
        <ol className="relative space-y-4 border-border border-l pl-5">
          {sortedEvents.map((event) => (
            <li className="relative" key={event.id ?? `${event.event_type}-${event.created_at}`}>
              <span className="absolute top-1.5 -left-[1.35rem] size-2.5 rounded-full border-2 border-background bg-primary" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {titleCaseFromSnake(event.event_type)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatShortDateIN(event.created_at)}
                </p>
                {event.message ? (
                  <p className="text-sm">{event.message}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          description="No activity has been recorded for this entry yet."
          title="No events yet"
        />
      )}
    </SectionCard>
  );
}
