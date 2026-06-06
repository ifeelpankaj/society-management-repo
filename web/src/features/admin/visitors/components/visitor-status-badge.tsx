import { EntityStatusBadge } from "@/components/shared/entity-status-badge";
import {
  VISITOR_STATUS_LABELS,
  VISITOR_STATUS_STYLES,
  type VisitorStatusKey,
} from "@/lib/constants/visitor-status";

type VisitorStatusBadgeProps = {
  status?: VisitorStatusKey | null;
  className?: string;
};

function VisitorStatusBadge({ status, className }: VisitorStatusBadgeProps) {
  return (
    <EntityStatusBadge
      className={className}
      labels={VISITOR_STATUS_LABELS}
      status={status}
      styles={VISITOR_STATUS_STYLES}
    />
  );
}

export { VisitorStatusBadge, type VisitorStatusBadgeProps };
