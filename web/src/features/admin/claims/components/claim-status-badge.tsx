import { EntityStatusBadge } from "@/components/shared/entity-status-badge";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_STYLES,
  type ClaimStatusKey,
} from "@/lib/constants/claim-status";

type ClaimStatusBadgeProps = {
  status?: ClaimStatusKey | null;
  className?: string;
};

function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  return (
    <EntityStatusBadge
      className={className}
      labels={CLAIM_STATUS_LABELS}
      status={status}
      styles={CLAIM_STATUS_STYLES}
    />
  );
}

export { ClaimStatusBadge, type ClaimStatusBadgeProps };
