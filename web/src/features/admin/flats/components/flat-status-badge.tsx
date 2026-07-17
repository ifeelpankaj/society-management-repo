import { EntityStatusBadge } from "@/components/shared/entity-status-badge";
import {
  FLAT_STATUS_LABELS,
  FLAT_STATUS_STYLES,
  type FlatStatusKey,
} from "@/lib/constants/flat-status";

type FlatStatusBadgeProps = {
  status?: FlatStatusKey | null;
  className?: string;
};

function FlatStatusBadge({ status, className }: FlatStatusBadgeProps) {
  return (
    <EntityStatusBadge
      className={className}
      labels={FLAT_STATUS_LABELS}
      status={status}
      styles={FLAT_STATUS_STYLES}
    />
  );
}

export { FlatStatusBadge, type FlatStatusBadgeProps };
