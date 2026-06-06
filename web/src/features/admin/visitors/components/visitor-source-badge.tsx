import { EntityStatusBadge } from "@/components/shared/entity-status-badge";
import {
  VISITOR_SOURCE_LABELS,
  VISITOR_SOURCE_STYLES,
  type VisitorSourceKey,
} from "@/lib/constants/visitor-source";

type VisitorSourceBadgeProps = {
  source?: VisitorSourceKey | null;
  className?: string;
};

function VisitorSourceBadge({ source, className }: VisitorSourceBadgeProps) {
  return (
    <EntityStatusBadge
      className={className}
      labels={VISITOR_SOURCE_LABELS}
      status={source}
      styles={VISITOR_SOURCE_STYLES}
    />
  );
}

export { VisitorSourceBadge, type VisitorSourceBadgeProps };
