import { EntityStatusBadge } from "@/components/shared/entity-status-badge";
import {
  SOCIETY_STATUS_LABELS,
  SOCIETY_STATUS_STYLES,
  type SocietyStatusKey,
} from "@/lib/constants/society-status";

type SocietyStatusBadgeProps = {
  status?: SocietyStatusKey | string | null;
  className?: string;
};

function SocietyStatusBadge({ status, className }: SocietyStatusBadgeProps) {
  const normalized =
    status && status in SOCIETY_STATUS_LABELS
      ? (status as SocietyStatusKey)
      : undefined;

  return (
    <EntityStatusBadge
      className={className}
      labels={SOCIETY_STATUS_LABELS}
      status={normalized}
      styles={SOCIETY_STATUS_STYLES}
    />
  );
}

export { SocietyStatusBadge, type SocietyStatusBadgeProps };
