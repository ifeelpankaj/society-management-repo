import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EntityStatusBadgeProps<T extends string> = {
  status?: T | null;
  labels: Record<T, string>;
  styles: Record<T, string>;
  fallback?: string;
  className?: string;
};

function EntityStatusBadge<T extends string>({
  status,
  labels,
  styles,
  fallback = "Unknown",
  className,
}: EntityStatusBadgeProps<T>) {
  if (!status || !(status in labels)) {
    return (
      <Badge className={className} variant="outline">
        {fallback}
      </Badge>
    );
  }

  const key = status as T;

  return (
    <Badge
      className={cn("capitalize", styles[key], className)}
      variant="outline"
    >
      {labels[key]}
    </Badge>
  );
}

export { EntityStatusBadge, type EntityStatusBadgeProps };
