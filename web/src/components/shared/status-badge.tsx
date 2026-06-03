import { Badge } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type StatusKey,
} from "@/lib/constants/status";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: StatusKey;
  className?: string;
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export { StatusBadge, type StatusBadgeProps };
